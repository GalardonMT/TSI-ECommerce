from django.contrib import admin
from .models import Categoria, Producto, ProductoImagen, MovimientoInventario

# Registro básico para que aparezcan en el panel
admin.site.register(Categoria)
admin.site.register(Producto)
admin.site.register(ProductoImagen)
admin.site.register(MovimientoInventario)