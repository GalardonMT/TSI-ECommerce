from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone 


class CuentaManager(BaseUserManager):
    def create_user(self, correo, password=None, **extra_fields):
        if not correo:
            raise ValueError("El correo es obligatorio")
        
        correo = self.normalize_email(correo)

        if 'rol' not in extra_fields or extra_fields['rol'] is None:
            try:
                rol_cliente = Rol.objects.get(id_rol=1)
            except Rol.DoesNotExist:
                rol_cliente, _ = Rol.objects.get_or_create(nombre_rol="Cliente")
            extra_fields['rol'] = rol_cliente

        user = self.model(correo=correo, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, correo, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser requiere is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser requiere is_superuser=True")
        return self.create_user(correo, password, **extra_fields)

class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=100)

    class Meta:
        db_table = 'ROL'
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
    
    def __str__(self):
        return self.nombre_rol

class Direccion(models.Model):
    id_direccion = models.AutoField(primary_key=True)
    calle = models.CharField(max_length=100)
    numero = models.CharField(max_length=50)
    comuna = models.CharField(max_length=50)
    region = models.CharField(max_length=50)
    depto_oficina = models.CharField(
        max_length=20, blank=True, null=True,
        help_text="Depto / Oficina / Otro dato adicional"
    )

    class Meta:
        db_table = 'DIRECCION'
        verbose_name = 'Direccion'
        verbose_name_plural = 'Direcciones'

    def __str__(self):
        return f"{self.calle} {self.numero}, {self.comuna}, {self.region}"

class Usuario(AbstractBaseUser, PermissionsMixin):
    correo = models.EmailField(unique=True) 
    nombre = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100, blank=True)

    rut = models.CharField(max_length=100)
    telefono = models.CharField(max_length=100)
    
    rol = models.ForeignKey(
        Rol,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='id_rol'
    )
    direccion = models.ForeignKey(
        Direccion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='id_direccion'
    )
    
    # --- Campos requeridos por Django Admin ---
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # AÑADE ESTE CAMPO (PermissionsMixin lo espera)
    is_superuser = models.BooleanField(default=False) 
    
    date_joined = models.DateTimeField(auto_now_add=True)

    # --- Configuración ---
    objects = CuentaManager() 
    USERNAME_FIELD = 'correo'
    REQUIRED_FIELDS = ['nombre', 'apellido_paterno', 'rut', 'telefono'] 

    class Meta:
        db_table = 'USUARIO'

    def __str__(self):
        return self.correo
        
    # Estas propiedades están perfectas
    @property
    def first_name(self):
        return self.nombre
        
    @property
    def last_name(self):
        return self.apellido_paterno

class Empleado(models.Model):
    id_empleado = models.AutoField(primary_key=True)
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        db_column='id_usuario'
    )
    cargo = models.CharField(max_length=100)
    fecha_contratacion = models.DateField(default=timezone.now)

    class Meta:
        db_table = 'EMPLEADO'

    def __str__(self):
        return f"Empleado: {self.usuario.nombre} {self.usuario.apellido_paterno} ({self.cargo})"
    
