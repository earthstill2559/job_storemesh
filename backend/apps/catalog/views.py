from django.db.models import Q
from rest_framework import viewsets

from .models import Product
from .permissions import IsSellerOwnerOrReadOnly
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Product.objects.select_related("seller")
        user = self.request.user
        mine = self.request.query_params.get("mine")
        search = self.request.query_params.get("search")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        in_stock = self.request.query_params.get("in_stock")

        if mine == "true" and user.is_authenticated and user.is_seller():
            queryset = queryset.filter(seller=user)
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if min_price:
            queryset = queryset.filter(unit_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(unit_price__lte=max_price)
        if in_stock == "true":
            queryset = queryset.filter(quantity__gt=0)
        return queryset

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
