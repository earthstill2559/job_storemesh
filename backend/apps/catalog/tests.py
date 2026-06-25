from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Product

User = get_user_model()


class ProductPermissionTests(APITestCase):
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

    def test_seller_can_create_product(self):
        self.client.force_authenticate(self.seller)
        response = self.client.post(
            "/api/products/",
            {
                "title": "Desk Lamp",
                "description": "Adjustable LED lamp",
                "unit_price": "25.00",
                "quantity": 5,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)
        self.assertEqual(Product.objects.first().seller, self.seller)

    def test_buyer_cannot_create_product(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post(
            "/api/products/",
            {
                "title": "Desk Lamp",
                "description": "Adjustable LED lamp",
                "unit_price": "25.00",
                "quantity": 5,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
