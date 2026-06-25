from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    seller_email = serializers.EmailField(source="seller.email", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "seller",
            "seller_email",
            "title",
            "description",
            "unit_price",
            "quantity",
            "image",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "seller", "seller_email", "created_at", "updated_at")

    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Unit price must be zero or greater.")
        return value
