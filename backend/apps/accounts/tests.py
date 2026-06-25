from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class AccountTests(APITestCase):
    def test_register_returns_jwt_pair(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "buyer1",
                "email": "buyer1@example.com",
                "password": "strong-password-123",
                "role": "buyer",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertEqual(response.data["user"]["role"], "buyer")
