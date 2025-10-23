from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.conf import settings

class CuentaManager(BaseUserManager):
    def create_user(self, correo, password=None, **extra_fields):
        if not correo:
            raise ValueError("El correo es obligatorio")
        correo = self.normalize_email(correo)
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

class Cuenta(AbstractBaseUser, PermissionsMixin):
    # datos basicos
    correo = models.EmailField(unique=True)
    nombre = models.CharField(max_length=50)
    apellido_paterno = models.CharField(max_length=50)
    apellido_materno = models.CharField(max_length=50, blank=True, null=True)
    rut = models.CharField(max_length=12, unique=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)

    # rol
    class Rol(models.TextChoices):
        CLIENTE = "cliente", "Cliente"
        EMPLEADO = "empleado", "Empleado"
        ADMIN = "admin", "Admin"
    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.CLIENTE)

    # estado y auditoria
    is_active = models.BooleanField(default=True)   # equivalente a "estado"
    is_staff = models.BooleanField(default=False)
    creado_en = models.DateTimeField(default=timezone.now)
    actualizado_en = models.DateTimeField(auto_now=True)
    # last_login ya viene en AbstractBaseUser

    USERNAME_FIELD = "correo"
    REQUIRED_FIELDS = ["nombre", "apellido_paterno", "rut"]

    objects = CuentaManager()

    def __str__(self):
        return f"{self.correo} ({self.rol})"

class Cliente(models.Model):
    cuenta = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cliente"
    )
    direccion = models.ForeignKey(
        "Direccion", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="clientes"
    )
    rut = models.CharField(max_length=12, unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(blank=True, null=True)  # opcional si ya lo tienes en Cuenta
    estado = models.BooleanField(default=True)

    def __str__(self):
        return f"Cliente: {self.cuenta.nombre} {self.cuenta.apellido_paterno}"
    
class Empleado(models.Model):
    cuenta = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="empleado"
    )
    rut = models.CharField(max_length=12, unique=True)
    nombre = models.CharField(max_length=50)
    apellido_paterno = models.CharField(max_length=50)
    apellido_materno = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    estado = models.BooleanField(default=True)
    ultimo_login = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Empleado: {self.nombre} {self.apellido_paterno}"
    
class Direccion(models.Model):
    cuenta = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="direcciones"
    )
    calle = models.CharField(max_length=100)
    numero = models.CharField(max_length=10)
    region = models.CharField(max_length=50)
    comuna = models.CharField(max_length=50)
    numero_departamento = models.CharField(
        max_length=20, blank=True, null=True,
        help_text="Depto / Oficina / Otro dato adicional"
    )
    codigo_postal = models.CharField(max_length=10, blank=True, null=True)
    referencia = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.calle} {self.numero}, {self.comuna}, {self.region}"