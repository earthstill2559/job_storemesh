from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from apps.catalog.models import Product

from .models import Order, OrderItem


class OrderItemReadSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source="product.id", read_only=True)
    seller_id = serializers.IntegerField(source="seller.id", read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product_id", "seller_id", "title", "unit_price", "quantity", "line_total")


class OrderReadSerializer(serializers.ModelSerializer):
    buyer_email = serializers.EmailField(source="buyer.email", read_only=True)
    items = OrderItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "buyer", "buyer_email", "status", "total", "items", "created_at")
        read_only_fields = fields


class CheckoutItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CheckoutSerializer(serializers.Serializer):
    items = CheckoutItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must contain at least one item.")
        return value

    def create(self, validated_data):
        buyer = self.context["request"].user
        requested_items = validated_data["items"]

        with transaction.atomic():
            product_ids = [item["product_id"] for item in requested_items]
            products = {
                product.id: product
                for product in Product.objects.select_for_update().filter(id__in=product_ids)
            }

            order_items = []
            total = Decimal("0.00")
            for item in requested_items:
                product = products.get(item["product_id"])
                if product is None:
                    raise serializers.ValidationError("One or more products were not found.")

                quantity = item["quantity"]
                if product.quantity < quantity:
                    raise serializers.ValidationError(
                        f"{product.title} only has {product.quantity} item(s) in stock."
                    )

                line_total = product.unit_price * quantity
                product.quantity -= quantity
                product.save(update_fields=["quantity", "updated_at"])
                total += line_total
                order_items.append(
                    OrderItem(
                        product=product,
                        seller=product.seller,
                        title=product.title,
                        unit_price=product.unit_price,
                        quantity=quantity,
                        line_total=line_total,
                    )
                )

            order = Order.objects.create(buyer=buyer, total=total)
            for order_item in order_items:
                order_item.order = order
            OrderItem.objects.bulk_create(order_items)
            return order
