from rest_framework import permissions


class IsBuyerForCreate(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == "POST":
            return bool(request.user and request.user.is_authenticated and request.user.is_buyer())
        return bool(request.user and request.user.is_authenticated)
