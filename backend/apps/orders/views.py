from rest_framework import mixins, status, viewsets
from rest_framework.response import Response

from .models import Order
from .permissions import IsBuyerForCreate
from .serializers import CheckoutSerializer, OrderReadSerializer


class OrderViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsBuyerForCreate]

    def get_serializer_class(self):
        if self.action == "create":
            return CheckoutSerializer
        return OrderReadSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.prefetch_related("items", "items__product", "items__seller").select_related("buyer")
        if user.is_buyer():
            return queryset.filter(buyer=user)
        if user.is_seller():
            return queryset.filter(items__seller=user).distinct()
        return queryset.none()

    def perform_create(self, serializer):
        serializer.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderReadSerializer(order).data, status=status.HTTP_201_CREATED)
