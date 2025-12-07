from rest_framework import serializers
from .models import Reserva, DetalleReserva
from inventario.models import Producto

class DetalleReservaSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.CharField(source="producto.nombre", read_only=True)
    imagen = serializers.CharField(source="producto.imagen", read_only=True)  # si agregas campo imagen
    
    class Meta:
        model = DetalleReserva
        fields = ['id', 'producto', 'nombre_producto', 'cantidad', 'precio_unitario', 'imagen']


class ReservaSerializer(serializers.ModelSerializer):
    detalles = DetalleReservaSerializer(many=True, read_only=True)
    cliente = serializers.SerializerMethodField()
    direccion = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = [
            'id_reserva',
            'fecha_creacion',
            'estado',
            'cliente',
            'direccion',
            'detalles',
        ]

    def get_cliente(self, obj):
        user = obj.usuario
        if not user:
            return None
        return {
            "nombre": user.nombre,
            "apellido_paterno": user.apellido_paterno,
            "apellido_materno": user.apellido_materno,
            "correo": user.correo,
            "telefono": user.telefono,
        }

    def get_direccion(self, obj):
        direccion = getattr(obj.usuario, "direccion", None)
        if not direccion:
            return None
        return {
            "calle": direccion.calle,
            "numero": direccion.numero,
            "comuna": direccion.comuna,
            "region": direccion.region,
            "depto_oficina": direccion.depto_oficina,
        }
