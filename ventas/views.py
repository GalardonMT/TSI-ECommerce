from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, viewsets, permissions
from .models import Reserva, DetalleReserva
from inventario.models import Producto
from .serializers import ReservaSerializer
from django.utils import timezone 
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from datetime import timedelta

class CarritoView(APIView):
    permission_classes = [IsAuthenticated]

    def _restore_stock(self, reserva: Reserva):
        for det in reserva.detalles.select_related("producto").all():
            prod = det.producto
            if prod:
                prod.stock_disponible += det.cantidad
                prod.save(update_fields=["stock_disponible"])

    def get_carrito(self, user):
        stale_cutoff = timezone.now() - timedelta(hours=1)
        reserva = (
            Reserva.objects.filter(usuario=user, estado='CARRO')
            .prefetch_related('detalles__producto')
            .first()
        )

        if reserva and reserva.ultima_actividad and reserva.ultima_actividad < stale_cutoff:
            # cart expired: restore stock and drop it
            with transaction.atomic():
                self._restore_stock(reserva)
                reserva.delete()
            reserva = None

        if not reserva:
            reserva = Reserva.objects.create(
                usuario=user,
                estado='CARRO',
                fecha_reserva=timezone.now(),
                ultima_actividad=timezone.now(),
            )

        return reserva

    # Obtener carrito actual
    def get(self, request):
        reserva = self.get_carrito(request.user)
        # keep cart alive on view
        reserva.ultima_actividad = timezone.now()
        reserva.save(update_fields=["ultima_actividad"])
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

        reserva.ultima_actividad = timezone.now()
        reserva.save(update_fields=["ultima_actividad"])

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

        reserva.ultima_actividad = timezone.now()
        reserva.save(update_fields=["ultima_actividad"])

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

        reserva.ultima_actividad = timezone.now()
        reserva.save(update_fields=["ultima_actividad"])

        return Response({"message": "Producto eliminado"})

    def patch(self, request):
        try:
            reserva = Reserva.objects.filter(usuario=request.user, estado='CARRO').first()
            if not reserva:
                return Response({"detail": "No hay un carrito activo."}, status=status.HTTP_404_NOT_FOUND)

            if not reserva.detalles.exists():
                return Response({"detail": "El carrito está vacío."}, status=status.HTTP_400_BAD_REQUEST)

            reserva.estado = 'PENDIENTE'
            reserva.fecha_reserva = timezone.now()
            reserva.save(update_fields=['estado', 'fecha_reserva'])

            # Serialize response
            serializer = ReservaSerializer(reserva)

            # Try to send confirmation email
            try:
                user = getattr(reserva, 'usuario', None)
                # Prefer 'correo' if available, fallback to 'email'
                email = getattr(user, 'correo', None) or getattr(user, 'email', None)
                if email:
                    subject = f"Reserva #{reserva.id_reserva} confirmada"
                    total = sum(d.cantidad * d.precio_unitario for d in reserva.detalles.all())
                    lines = [
                        "Gracias por tu compra!",
                        f"Tu reserva #{reserva.id_reserva} ha sido confirmada.",
                        f"Fecha: {reserva.fecha_reserva.strftime('%Y-%m-%d %H:%M')}",
                        f"Estado: {reserva.estado}",
                        "",
                        "Detalles:",
                    ]
                    for d in reserva.detalles.all():
                        lines.append(f"- {getattr(d.producto, 'nombre', d.producto_id)} x{d.cantidad} — CLP {d.precio_unitario}")
                    lines.extend([
                        "",
                        f"Total: CLP {int(total)}",
                        "",
                        "Datos de pago (transferencia):",
                        "Titular: TSI E-Commerce SpA",
                        "Banco: Banco de Chile",
                        "Cuenta: 12-345-67890-1",
                        "RUT: 76.123.456-7",
                        "Correo de confirmación: pagos@tsi-ecommerce.example",
                        "",
                        "Contacto:",
                        "WhatsApp: +56 9 8765 4321",
                        "Soporte: soporte@tsi-ecommerce.example",
                        "",
                        "Envía el comprobante de pago una vez realizada la transferencia al correo indicado anteriormente.",
                    ])
                    message = "\n".join(lines)

                    send_mail(
                        subject,
                        message,
                        getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@tsi-ecommerce.local'),
                        [email],
                        fail_silently=True,
                    )
            except Exception:
                # Do not block checkout if email fails
                pass

            # Notify store owner about new order
            try:
                owner_email = 'tsiprueba75@gmail.com'
                subject_owner = f"Nueva reserva creada #{reserva.id_reserva}"
                total_owner = sum(d.cantidad * d.precio_unitario for d in reserva.detalles.all())
                user = getattr(reserva, 'usuario', None)
                user_email = getattr(user, 'correo', None) or getattr(user, 'email', None) or 'correo no disponible'
                lines_owner = [
                    "Se creó una nueva reserva.",
                    f"ID: {reserva.id_reserva}",
                    f"Estado: {reserva.estado}",
                    f"Fecha: {reserva.fecha_reserva.strftime('%Y-%m-%d %H:%M')}",
                    f"Usuario: {user_email}",
                    "",
                    "Detalles:",
                ]
                for d in reserva.detalles.all():
                    lines_owner.append(f"- {getattr(d.producto, 'nombre', d.producto_id)} x{d.cantidad} — CLP {d.precio_unitario}")
                lines_owner.extend([
                    "",
                    f"Total: CLP {int(total_owner)}",
                ])

                send_mail(
                    subject_owner,
                    "\n".join(lines_owner),
                    getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@tsi-ecommerce.local'),
                    [owner_email],
                    fail_silently=True,
                )
            except Exception:
                # Do not block checkout if owner notification fails
                pass

            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as exc:  # keep checkout from failing silently
            return Response(
                {
                    "detail": "Reserva confirmada, pero no se pudo serializar la respuesta",
                    "id_reserva": reserva.id_reserva if 'reserva' in locals() and reserva else None,
                    "error": str(exc),
                },
                status=status.HTTP_200_OK,
            )


class PedidosUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    allowed_statuses = {"PENDIENTE", "CONFIRMADA", "COMPLETADA", "CANCELADA"}

    def get(self, request):
        estados_param = request.query_params.getlist("estado")

        if estados_param:
            estados_filtrados = {
                estado.upper()
                for estado in estados_param
                if estado and estado.upper() in self.allowed_statuses
            }
        else:
            estados_filtrados = self.allowed_statuses

        pedidos = Reserva.objects.filter(
            usuario=request.user,
            usuario__isnull=False,
            estado__in=estados_filtrados
        ).select_related('usuario').prefetch_related('detalles__producto').order_by('-fecha_reserva', '-id_reserva')

        serializer = ReservaSerializer(pedidos, many=True)
        return Response(serializer.data)


class IsStaffOrSuper(permissions.BasePermission):
    """Allow access to staff or superusers."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.is_superuser)
        )


class ReservaAdminViewSet(viewsets.ModelViewSet):
    queryset = (
        Reserva.objects.exclude(estado='CARRO')
        .select_related('usuario__direccion')
        .prefetch_related('detalles__producto')
        .order_by("-fecha_reserva", "-id_reserva")
    )
    serializer_class = ReservaSerializer

    def _restore_stock(self, reserva: Reserva):
        """Return product stock for all items in a reserva."""
        for det in reserva.detalles.select_related('producto').all():
            producto = det.producto
            if not producto:
                continue
            producto.stock_disponible += det.cantidad
            producto.save(update_fields=["stock_disponible"])

    def _send_status_email(self, reserva, previous_estado):
        """Notify user when order status changes."""
        try:
            user = getattr(reserva, 'usuario', None)
            email = getattr(user, 'correo', None) or getattr(user, 'email', None)
            if not email:
                return

            total = sum(d.cantidad * d.precio_unitario for d in reserva.detalles.all())
            subject = f"Actualización de estado - Reserva #{reserva.id_reserva}"
            lines = [
                "Actualizamos el estado de tu pedido:",
                f"Reserva: #{reserva.id_reserva}",
                f"Estado anterior: {previous_estado}",
                f"Nuevo estado: {reserva.estado}",
                f"Fecha: {timezone.now().strftime('%Y-%m-%d %H:%M')}",
                "",
                "Detalles:",
            ]
            for d in reserva.detalles.all():
                lines.append(f"- {getattr(d.producto, 'nombre', d.producto_id)} x{d.cantidad} — CLP {d.precio_unitario}")
            lines.extend([
                "",
                f"Total: CLP {int(total)}",
                "",
                "Contacto:",
                "WhatsApp: +56 9 8765 4321",
                "Soporte: soporte@tsi-ecommerce.example",
                "",
                "Si tienes alguna pregunta sobre este cambio, contáctanos de inmediato.",
            ])

            send_mail(
                subject,
                "\n".join(lines),
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@tsi-ecommerce.local'),
                [email],
                fail_silently=True,
            )
        except Exception:
            # never block admin updates on email issues
            pass

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        previous_estado = getattr(instance, 'estado', None)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        updated = serializer.instance
        if getattr(updated, 'estado', previous_estado) != previous_estado:
            self._send_status_email(updated, previous_estado)

        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        with transaction.atomic():
            self._restore_stock(instance)
            self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_permissions(self):
        # Only staff/superusers can see or modify reservas via admin
        permission_classes = [IsStaffOrSuper]
        return [perm() for perm in permission_classes]
