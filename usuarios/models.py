from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

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
