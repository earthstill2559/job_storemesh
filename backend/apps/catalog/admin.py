from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "seller", "unit_price", "quantity", "updated_at")
    list_filter = ("seller",)
    search_fields = ("title", "description", "seller__email")
