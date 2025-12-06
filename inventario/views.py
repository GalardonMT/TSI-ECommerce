from django.shortcuts import render

from rest_framework import viewsets, permissions
from .models import Producto
from .serializers import ProductoSerializer


class IsStaffOrSuper(permissions.BasePermission):
    """Allow access to staff or superusers."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser))


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().order_by('nombre')
    serializer_class = ProductoSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            permission_classes = [permissions.IsAuthenticated, IsStaffOrSuper]
        else:
            permission_classes = [permissions.AllowAny]
        return [perm() for perm in permission_classes]

# Create your views here.
