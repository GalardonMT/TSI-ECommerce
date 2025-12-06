from rest_framework import serializers
from .models import Producto, ProductoImagen, Categoria

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id_categoria", "nombre"]

class ProductoImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductoImagen
        fields = ["id_imagen", "image", "orden"]


class ProductoSerializer(serializers.ModelSerializer):
    imagenes = ProductoImagenSerializer(many=True, required=False)
    categoria = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all(), allow_null=True, required=False)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Producto
        fields = [
            "id_producto",
            "categoria",
            "categoria_nombre", 
            "nombre",
            "descripcion",
            "precio",
            "stock_disponible",
            "imagenes",
        ]

    def create(self, validated_data):
        imagenes_data = validated_data.pop('imagenes', None)
        producto = Producto.objects.create(**validated_data)
        if imagenes_data:
            for img in imagenes_data:
                ProductoImagen.objects.create(producto=producto, **img)
        return producto

    def update(self, instance, validated_data):
        imagenes_data = validated_data.pop('imagenes', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if imagenes_data is not None:
            # simple strategy: delete existing and recreate
            instance.imagenes.all().delete()
            for img in imagenes_data:
                ProductoImagen.objects.create(producto=instance, **img)
        return instance