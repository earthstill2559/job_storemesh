from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        SELLER = "seller", "Seller"
        BUYER = "buyer", "Buyer"

    role = models.CharField(max_length=10, choices=Role.choices)
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "role"]

    def is_seller(self):
        return self.role == self.Role.SELLER

    def is_buyer(self):
        return self.role == self.Role.BUYER
