from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from django.db.models.deletion import ProtectedError

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

    def get_queryset(self):
        """
        Sobrescribimos esto para permitir filtrar por destacados
        """
        queryset = Producto.objects.all()
        destacado = self.request.query_params.get('destacado')
        
        if destacado is not None:
            # Si en la URL viene ?destacado=true, filtramos
            if destacado.lower() == 'true':
                queryset = queryset.filter(destacado=True)
        
        return queryset

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            permission_classes = [permissions.IsAuthenticated, IsStaffOrSuper]
        else:
            permission_classes = [permissions.AllowAny]
        return [perm() for perm in permission_classes]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response(
                {
                    "detail": "No se puede eliminar el producto porque tiene reservas asociadas.",
                    "code": "product_has_reservations",
                },
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            permission_classes = [permissions.IsAuthenticated, IsStaffOrSuper]
        else:
            permission_classes = [permissions.AllowAny]
        return [perm() for perm in permission_classes]