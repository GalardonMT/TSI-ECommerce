from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, viewsets, permissions
from .models import Reserva, DetalleReserva
from inventario.models import Producto
from .serializers import ReservaSerializer
from django.utils import timezone 

class CarritoView(APIView):
    permission_classes = [IsAuthenticated]

    def get_carrito(self, user):
        reserva, _ = Reserva.objects.get_or_create(
            usuario=user,
            estado='PENDIENTE',
            defaults={'fecha_reserva': timezone.now()}
        )
        return reserva

    # Obtener carrito actual
    def get(self, request):
        reserva = self.get_carrito(request.user)
        serializer = ReservaSerializer(reserva)
        return Response(serializer.data)

    # Agregar producto / actualizar cantidad
    def post(self, request):
        producto_id = request.data.get("producto_id")
        cantidad = int(request.data.get("cantidad", 1) or 1)

        reserva = self.get_carrito(request.user)
        producto = Producto.objects.get(id_producto=producto_id)

        if producto.stock_disponible < cantidad:
            return Response({"detail": "Stock insuficiente"}, status=status.HTTP_400_BAD_REQUEST)

        detalle, created = DetalleReserva.objects.get_or_create(
            reserva=reserva,
            producto=producto,
            defaults={
                "cantidad": cantidad,
                "precio_unitario": producto.precio
            }
        )

        if not created:
            detalle.cantidad += cantidad
            detalle.save()

        # Descontar stock del producto
        producto.stock_disponible -= cantidad
        producto.save(update_fields=["stock_disponible"])

        return Response({"message": "Producto agregado"}, status=200)

    # Editar cantidad
    def put(self, request):
        producto_id = request.data.get("producto_id")
        cantidad = request.data.get("cantidad")

        reserva = self.get_carrito(request.user)
        detalle = DetalleReserva.objects.get(reserva=reserva, producto_id=producto_id)

        # Calcular diferencia para ajustar stock
        diferencia = cantidad - detalle.cantidad

        if cantidad <= 0:
            # devolver todo el stock al producto
            producto = detalle.producto
            producto.stock_disponible += detalle.cantidad
            producto.save(update_fields=["stock_disponible"])
            detalle.delete()
            return Response({"message": "Producto eliminado"})

        # Si aumenta cantidad, verificar stock
        producto = detalle.producto
        if diferencia > 0 and producto.stock_disponible < diferencia:
            return Response({"detail": "Stock insuficiente"}, status=status.HTTP_400_BAD_REQUEST)

        # Actualizar detalle y stock
        detalle.cantidad = cantidad
        detalle.save()
        producto.stock_disponible -= diferencia
        producto.save(update_fields=["stock_disponible"])

        return Response({"message": "Cantidad actualizada"})

    # Eliminar producto
    def delete(self, request):
        producto_id = request.data.get("producto_id")

        reserva = self.get_carrito(request.user)
        detalle = DetalleReserva.objects.get(reserva=reserva, producto_id=producto_id)

        # Devolver stock al producto al eliminar del carrito
        producto = detalle.producto
        producto.stock_disponible += detalle.cantidad
        producto.save(update_fields=["stock_disponible"])

        detalle.delete()

        return Response({"message": "Producto eliminado"})


class IsStaffOrSuper(permissions.BasePermission):
    """Allow access to staff or superusers."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )


class ReservaAdminViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all().order_by("-fecha_reserva")
    serializer_class = ReservaSerializer

    def get_permissions(self):
        # Only staff/superusers can see or modify reservas via admin
        permission_classes = [IsStaffOrSuper]
        return [perm() for perm in permission_classes]
