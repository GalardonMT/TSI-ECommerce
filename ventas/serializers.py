from rest_framework import serializers
from .models import Reserva, DetalleReserva
from inventario.models import Producto

class DetalleReservaSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.CharField(source="producto.nombre", read_only=True)
    imagen = serializers.CharField(source="producto.imagen", read_only=True)  # si agregas campo imagen
    stock_disponible = serializers.IntegerField(source="producto.stock_disponible", read_only=True)

    class Meta:
        model = DetalleReserva
        fields = [
            'id',
            'producto',
            'nombre_producto',
            'cantidad',
            'precio_unitario',
            'imagen',
            'stock_disponible',
        ]


class ReservaSerializer(serializers.ModelSerializer):
    detalles = DetalleReservaSerializer(many=True, read_only=True)

    class Meta:
        model = Reserva
        fields = ['id_reserva', 'fecha_creacion', 'estado', 'detalles']
