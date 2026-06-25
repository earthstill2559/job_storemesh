from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import Product

from .models import Order

User = get_user_model()


class CheckoutTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            username="seller",
            email="seller@example.com",
            password="strong-password-123",
            role="seller",
        )
        self.buyer = User.objects.create_user(
            username="buyer",
            email="buyer@example.com",
            password="strong-password-123",
            role="buyer",
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title="Tea Sampler",
            description="Six herbal blends",
            unit_price="12.00",
            quantity=5,
        )

    def test_buyer_checkout_decrements_inventory(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post(
            "/api/orders/",
            {"items": [{"product_id": self.product.id, "quantity": 2}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 3)
        self.assertEqual(Order.objects.count(), 1)

    def test_insufficient_stock_rejects_checkout(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post(
            "/api/orders/",
            {"items": [{"product_id": self.product.id, "quantity": 99}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 5)
