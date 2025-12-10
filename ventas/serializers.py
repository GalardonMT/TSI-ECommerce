from rest_framework import serializers
from .models import Reserva, DetalleReserva
from inventario.models import Producto

class DetalleReservaSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.CharField(source="producto.nombre", read_only=True)
    imagen = serializers.SerializerMethodField()
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

    def get_imagen(self, obj):
        """Return the first associated product image (text/URL) if present."""
        producto = getattr(obj, "producto", None)
        if not producto:
            return None
        imagen = producto.imagenes.first() if hasattr(producto, "imagenes") else None
        return getattr(imagen, "image", None)


class ReservaSerializer(serializers.ModelSerializer):
    detalles = DetalleReservaSerializer(many=True, read_only=True)
    cliente = serializers.SerializerMethodField()
    direccion = serializers.SerializerMethodField()
    correo_usuario = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = [
            'id_reserva',
            'fecha_creacion',
            'fecha_reserva',
            'estado',
            'correo_usuario',
            'cliente',
            'direccion',
            'detalles',
        ]

    def get_correo_usuario(self, obj):
        usuario = getattr(obj, "usuario", None)
        if not usuario:
            return None
        return getattr(usuario, "correo", None) or getattr(usuario, "email", None)

    def get_cliente(self, obj):
        usuario = getattr(obj, "usuario", None)
        if not usuario:
            return None
        return {
            "nombre": getattr(usuario, "nombre", ""),
            "apellido_paterno": getattr(usuario, "apellido_paterno", ""),
            "apellido_materno": getattr(usuario, "apellido_materno", ""),
            "correo": getattr(usuario, "correo", None) or getattr(usuario, "email", None),
            "telefono": getattr(usuario, "telefono", ""),
        }

    def get_direccion(self, obj):
        usuario = getattr(obj, "usuario", None)
        direccion = getattr(usuario, "direccion", None) if usuario else None
        if not direccion:
            return None
        return {
            "calle": getattr(direccion, "calle", ""),
            "numero": getattr(direccion, "numero", ""),
            "comuna": getattr(direccion, "comuna", ""),
            "region": getattr(direccion, "region", ""),
            "depto_oficina": getattr(direccion, "depto_oficina", None),
        }
