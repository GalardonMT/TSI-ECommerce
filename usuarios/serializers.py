import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Direccion, Rol
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

# ------------------ Helpers / validadores ------------------
def validar_digits_only(value, campo_nombre="valor"):
    """
    Acepta 'value' como str o int; valida que contenga solo dígitos y al menos 1.
    Devuelve la versión string limpia si pasa; levanta serializers.ValidationError si falla.
    """
    if value is None:
        raise serializers.ValidationError(f"{campo_nombre} es obligatorio.")
    s = str(value).strip()
    if s == "":
        raise serializers.ValidationError(f"{campo_nombre} es obligatorio.")
    if not s.isdigit():
        raise serializers.ValidationError(f"{campo_nombre} debe contener solo dígitos (0-9).")
    return s

def validar_numero_direccion(value):
    return validar_digits_only(value, campo_nombre="Número de dirección")

def validar_telefono(value):
    return validar_digits_only(value, campo_nombre="Teléfono")

def validar_rut_chileno(rut: str):
    """
    Valida formato RUT: dígitos + '-' + verificador (1 carácter: dígito o K/k).
    Ejemplos válidos: '12345678-9', '12345678-K'
    Normaliza quitando puntos y espacios antes de validar.
    """
    if rut is None:
        raise serializers.ValidationError("RUT es obligatorio.")
    rut_norm = str(rut).replace(".", "").replace(" ", "").strip()
    # patrón: uno o más dígitos, guion, exactamente un carácter verificador (0-9 o K/k)
    if not re.fullmatch(r"^\d+-[\dKk]$", rut_norm):
        raise serializers.ValidationError("Formato RUT inválido. Debe tener un guion antes del dígito verificador (ej: 12345678-9).")
    return rut_norm

# ------------------ Serializers ------------------
class DireccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Direccion
        fields = ["id_direccion", "calle", "numero", "comuna", "region", "depto_oficina"]
        read_only_fields = ("id_direccion",)

    def validate_numero(self, value):
        # número de dirección debe ser dígitos
        return validar_numero_direccion(value)


class UserSerializer(serializers.ModelSerializer):
    """Serializa la info básica del usuario actualmente en tu modelo."""
    direccion = DireccionSerializer(read_only=True)
    rol = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "correo", "nombre", "apellido_paterno", "apellido_materno",
            "rol", "direccion", "is_active", "is_staff", "is_superuser",
            "date_joined", "last_login", "rut", "telefono"
        ]
        read_only_fields = ["id", "date_joined", "last_login"]

    def get_rol(self, obj):
        if obj.rol:
            return {"id_rol": obj.rol.id_rol, "nombre_rol": obj.rol.nombre_rol}
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    id_rol = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    direccion = DireccionSerializer(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id", "correo", "nombre", "apellido_paterno", "apellido_materno",
            "rut", "telefono", "password", "password_confirm", "id_rol", "direccion"
        ]
        read_only_fields = ["id"]

    def validate_correo(self, value):
        if User.objects.filter(correo__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con ese correo.")
        return value

    def validate(self, attrs):
        # 1) passwords
        if attrs.get("password") != attrs.get("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})

        # 2) RUT obligatorio y formato
        rut = attrs.get("rut")
        if not rut:
            raise serializers.ValidationError({"rut": "RUT es obligatorio."})
        # validar_rut_chileno levanta serializers.ValidationError si no cumple
        attrs["rut"] = validar_rut_chileno(rut)

        # 3) Telefono obligatorio y solo dígitos
        telefono = attrs.get("telefono")
        if telefono is None:
            raise serializers.ValidationError({"telefono": "Teléfono es obligatorio."})
        attrs["telefono"] = validar_telefono(telefono)

        # 4) Si viene direccion anidada, validar 'numero' como dígitos
        direccion_data = attrs.get("direccion")
        if direccion_data:
            numero = direccion_data.get("numero")
            if numero is None:
                raise serializers.ValidationError({"direccion": {"numero": "Número de dirección es obligatorio."}})
            # validar_numero_direccion lanza serializers.ValidationError si no pasa
            direccion_data["numero"] = validar_numero_direccion(numero)
            # actualizar attrs.direccion con la versión normalizada
            attrs["direccion"] = direccion_data

        # 5) Validar la contraseña con validate_password (capturamos mensajes legibles)
        password = attrs.get("password")
        if password:
            try:
                validate_password(password, user=None)
            except DjangoValidationError as e:
                # e.messages es lista de strings; enviamos bajo la clave 'password'
                raise serializers.ValidationError({"password": list(e.messages)})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("password_confirm", None)
        id_rol = validated_data.pop("id_rol", None)
        direccion_data = validated_data.pop("direccion", None)

        direccion = None
        if direccion_data:
            # direccion.numero ya fue normalizado en validate()
            direccion = Direccion.objects.create(**direccion_data)

        # prepare extra_fields para pasar al manager.create_user
        extra_fields = validated_data.copy()  # contiene: correo, nombre, apellido_paterno, apellido_materno, rut, telefono

        # Si id_rol fue enviado, obtenemos la instancia y la ponemos en extra_fields
        if id_rol:
            try:
                rol = Rol.objects.get(id_rol=id_rol)
                extra_fields['rol'] = rol
            except Rol.DoesNotExist:
                raise serializers.ValidationError({"id_rol": "Rol no existe."})

        # Si creamos direccion, pásala en extra_fields (es FK)
        if direccion:
            extra_fields['direccion'] = direccion

        correo = extra_fields.pop('correo', None)
        if not correo:
            raise serializers.ValidationError({"correo": "Correo es obligatorio."})

        try:
            user = User.objects.create_user(correo=correo, password=password, **extra_fields)
        except Exception as e:
            raise serializers.ValidationError({"detail": "Error al crear usuario.", "error": str(e)})

        return user


class LoginSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)
