from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from ventas.models import Reserva


class Command(BaseCommand):
    help = "Cancela reservas en estado PENDIENTE con más de 24 horas de antigüedad"

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(hours=24)
        qs = (
            Reserva.objects.filter(estado="PENDIENTE", fecha_reserva__lt=cutoff)
            .prefetch_related("detalles__producto")
        )

        cancelled = 0

        with transaction.atomic():
            for reserva in qs:
                for det in reserva.detalles.all():
                    producto = det.producto
                    if not producto:
                        continue
                    producto.stock_disponible += det.cantidad
                    producto.save(update_fields=["stock_disponible"])

                reserva.estado = "CANCELADA"
                reserva.save(update_fields=["estado"])
                cancelled += 1

        self.stdout.write(self.style.SUCCESS(f"Reservas canceladas: {cancelled}"))
