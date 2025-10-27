from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
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
    referencia = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'DIRECCION'
        verbose_name = 'Direccion'
        verbose_name_plural = 'Direcciones'

    def __str__(self):
        return f"{self.calle} {self.numero}, {self.comuna}, {self.region}"

class Usuario(AbstractUser):
    correo = models.EmailField(unique=True) 
    nombre = models.CharField(max_length=100)
    apellido_paterno = models.CharField(max_length=100, blank=True)
    apellido_materno = models.CharField(max_length=100, blank=True)
    
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
    date_joined = models.DateTimeField(auto_now_add=True)

    # --- Configuración ---
    objects = CuentaManager() # Le decimos que use tu Manager

    USERNAME_FIELD = 'correo' # Le decimos que el login es con 'correo'
    REQUIRED_FIELDS = ['nombre', 'apellido_paterno'] # Campos pedidos al crear superuser

    class Meta:
        db_table = 'USUARIO'

    def __str__(self):
        return self.correo
        
    # Propiedades para que el Admin de Django funcione bien
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
    
