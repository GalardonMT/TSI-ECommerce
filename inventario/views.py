from rest_framework import permissions, viewsets

from .models import Categoria, Producto
from .serializers import CategoriaSerializer, ProductoSerializer


class IsStaffOrSuper(permissions.BasePermission):
    """Allow access to staff or superusers."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            permission_classes = [permissions.IsAuthenticated, IsStaffOrSuper]
        else:
            permission_classes = [permissions.AllowAny]
        return [perm() for perm in permission_classes]


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            permission_classes = [permissions.IsAuthenticated, IsStaffOrSuper]
        else:
            permission_classes = [permissions.AllowAny]
        return [perm() for perm in permission_classes]