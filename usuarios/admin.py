from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Rol, Direccion, Empleado

# ===================================================================
# 1. ADMIN PARA EL MODELO DE USUARIO PERSONALIZADO
# ===================================================================
@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    
    # --- Columnas a mostrar en la lista de usuarios ---
    list_display = (
        'id', 
        'correo', 
        'nombre', 
        'apellido_paterno', 
        'rol', 
        'is_active', 
        'is_staff',
        'telefono',
        'rut',
    )
    
    # --- Campos para la barra de búsqueda ---
    search_fields = ('correo', 'nombre', 'apellido_paterno')
    
    # --- Filtros laterales ---
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'rol')
    
    # --- Orden ---
    ordering = ('correo',)

    # --- Formulario para EDITAR un usuario existente ---
    # (Debemos redefinir esto porque no usamos 'username')
    fieldsets = (
        (None, {
            'fields': ('correo', 'password')
        }),
        ('Información Personal', {
            'fields': ('nombre', 'apellido_paterno', 'apellido_materno')
        }),
        ('Relaciones', {
            'fields': ('rol', 'direccion')
        }),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Fechas Importantes', {
            'fields': ('last_login', 'date_joined')
        }),
    )

    # --- Formulario para AÑADIR un nuevo usuario ---
    # (También lo redefinimos para incluir tus campos)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            # 'password2' es el campo de confirmación de contraseña
            'fields': ('correo', 'password', 'password2'),
        }),
        ('Información Personal', {
            'fields': ('nombre', 'apellido_paterno', 'apellido_materno')
        }),
        ('Relaciones', {
            'fields': ('rol', 'direccion')
        }),
        # Los permisos (is_staff, etc.) se definen en el CuentaManager
        # para create_superuser, así que no los ponemos aquí.
    )

    # Django necesita esto para saber qué campos usar del add_fieldsets
    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)


# ===================================================================
# 2. REGISTRO DE LOS OTROS MODELOS
# ===================================================================

@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('id_rol', 'nombre_rol')
    search_fields = ('nombre_rol',)

@admin.register(Direccion)
class DireccionAdmin(admin.ModelAdmin):
    list_display = ('id_direccion', 'calle', 'numero', 'comuna', 'region')
    search_fields = ('calle', 'comuna', 'region')
    list_filter = ('region', 'comuna')

@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = ('id_empleado', 'get_nombre_usuario', 'cargo', 'fecha_contratacion')
    search_fields = ('cargo', 'usuario__correo', 'usuario__nombre')
    list_filter = ('cargo',)

    @admin.display(description='Usuario')
    def get_nombre_usuario(self, obj):
        # Muestra el nombre completo en la lista
        return f"{obj.usuario.nombre} {obj.usuario.apellido_paterno}"