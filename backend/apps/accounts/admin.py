from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class StoreMeshUserAdmin(UserAdmin):
    list_display = ("email", "username", "role", "is_staff")
    list_filter = ("role", "is_staff", "is_superuser")
    fieldsets = UserAdmin.fieldsets + (("StoreMesh", {"fields": ("role",)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("StoreMesh", {"fields": ("email", "role")}),)
