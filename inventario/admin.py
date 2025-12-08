from django.contrib import admin
from .models import Categoria, Producto, ProductoImagen, MovimientoInventario

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'destacado') # Ver estas columnas
    list_editable = ('destacado',) # Poder editar esto sin entrar al producto
    
# Registro básico para que aparezcan en el panel
admin.site.register(Categoria)
# admin.site.register(Producto)
admin.site.register(ProductoImagen)
admin.site.register(MovimientoInventario)