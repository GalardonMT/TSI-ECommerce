from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from ventas.models import Reserva


class Command(BaseCommand):
    help = "Elimina carritos inactivos por más de 1 hora y restaura stock"

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(hours=1)
        qs = (
            Reserva.objects.filter(estado="CARRO", ultima_actividad__lt=cutoff)
            .prefetch_related("detalles__producto")
        )

        removed = 0
        with transaction.atomic():
            for reserva in qs:
                for det in reserva.detalles.all():
                    producto = det.producto
                    if producto:
                        producto.stock_disponible += det.cantidad
                        producto.save(update_fields=["stock_disponible"])
                reserva.delete()
                removed += 1

        self.stdout.write(self.style.SUCCESS(f"Carritos eliminados: {removed}"))
