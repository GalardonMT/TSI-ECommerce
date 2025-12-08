from django.db import models
from django.conf import settings
from django.utils import timezone # Asegúrate de importar timezone

# --- Importamos modelos de otras apps ---

Empleado = 'usuarios.Empleado'
Producto = 'inventario.Producto'

class Reserva(models.Model):
    id_reserva = models.AutoField(primary_key=True)

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        db_column='id_usuario'
    )

    empleado = models.ForeignKey(
        Empleado,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='id_empleado'
    )

    fecha_creacion = models.DateField(auto_now_add=True)
    fecha_reserva = models.DateField()

    ESTADO_OPCIONES = [
        ('CARRO', 'Carro'),
        ('PENDIENTE', 'Pendiente'),
        ('CONFIRMADA', 'Confirmada'),
        ('COMPLETADA', 'Completada'),
        ('CANCELADA', 'Cancelada'),
    ]
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_OPCIONES,
        default='CARRO'
    )

    class Meta:
        db_table = 'RESERVA'
        ordering = ['-fecha_reserva'] #Ordenar de las mas nuevas a las mas antiguas

    def __str__(self):
        correo = getattr(self.usuario, 'correo', None) or getattr(self.usuario, 'email', None) or 'Sin usuario'
        return f"Reserva {self.id_reserva} - {correo}"


class DetalleReserva(models.Model):
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        db_column='id_reserva',
        related_name='detalles'
    )
    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        db_column='id_producto'
    )
    cantidad = models.IntegerField()
    precio_unitario = models.IntegerField(
        help_text="Precio unitario en pesos al momento de la reserva"
    )

    class Meta:
        db_table = 'DETALLE_RESERVA'
        unique_together = ('reserva', 'producto')

    def __str__(self):
        return f"Detalle de Reserva {self.reserva.id_reserva}"