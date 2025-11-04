from django.db import models
from django.utils import timezone
from django.db.models import CheckConstraint, Q
from django.conf import settings 

Empleado = 'usuarios.Empleado'

class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True, help_text="Descripcion opcional")

    class Meta:
        db_table = 'CATEGORIA'
        verbose_name = 'Categoria'
        verbose_name_plural = "Categorias"
        ordering = ['nombre'] #Orden alfabetico

    def __str__(self):
        return self.nombre
        
class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True)
    
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='id_categoria'
    )

    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True, help_text="Descripcion opcional")
    precio = models.IntegerField(help_text="Precio unitario en pesos")
    stock_disponible = models.IntegerField(
        default=0,
        help_text="Stock actual disponible en inventario"
    )

    class Meta:
        db_table = 'PRODUCTO'
        verbose_name = 'Producto'
        verbose_name_plural  = 'Productos'
        ordering = ['nombre']
        constraints = [ #Restrccion el stock no puede ser negativo
            CheckConstraint(check=Q(stock_disponible__gte=0), name='stock_no_negativo')
        ]
        
    def __str__(self):
        return self.nombre
        

class MovimientoInventario(models.Model):
    MOTIVO_OPCIONES = [
        ('COMPRA', 'Compra de proveedor'),
        ('VENTA', 'Venta a cliente (Reserva)'),
        ('AJUSTE', 'Ajuste manual de stock'),
        ('DEVOLUCION', 'Devolucion de cliente'),
        ('MERMA', 'Merma o perdida'),
    ]

    id_movimiento = models.AutoField(primary_key=True)

    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        db_column='id_producto',
        related_name='movimientos'
    )

    empleado = models.ForeignKey(
        Empleado,
        on_delete=models.SET_NULL,
        null=True,
        db_column='id_empleado'
    )

    cantidad_cambio = models.IntegerField(help_text="Positivo para entrada, negativo para salida")

    motivo = models.CharField(
        max_length=50,
        choices=MOTIVO_OPCIONES
    )

    fecha_movimiento = models.DateField(default=timezone.now)

    class Meta:
        db_table = 'MOVIMIENTO_INVENTARIO'
        verbose_name = 'Movimiento de Inventario'
        verbose_name_plural = 'Movimientos de Inventario'
        ordering = ['-fecha_movimiento'] #ver los mas recientes primero

    def __str__(self):
        signo = '+' if self.cantidad_cambio > 0 else ''
        return f"[{self.fecha_movimiento}] {self.producto.nombre}: {signo}{self.cantidad_cambio}"