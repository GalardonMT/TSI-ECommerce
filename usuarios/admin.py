from django.contrib import admin
from .models import Cuenta

@admin.register(Cuenta)
class CuentaAdmin(admin.ModelAdmin):
    list_display = ("id", "correo", "nombre", "rol", "is_active", "last_login", "creado_en")
    search_fields = ("correo", "nombre", "rut")
    list_filter = ("rol", "is_active")
