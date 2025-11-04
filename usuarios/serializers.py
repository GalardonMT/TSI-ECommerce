from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Direccion, Rol
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

class DireccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Direccion
        fields = [
            "id_direccion", "calle", "numero", "comuna",
            "region", "depto_oficina", "referencia"
        ]
        read_only_fields = ("id_direccion",)

class UserSerializer(serializers.ModelSerializer):
    """Serializa la info básica del usuario actualmente en tu modelo."""
    direccion = DireccionSerializer(read_only=True)
    rol = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "correo", "nombre", "apellido_paterno", "apellido_materno",
            "rol", "direccion", "is_active", "is_staff", "is_superuser",
            "date_joined", "last_login"
        ]
        read_only_fields = ["id", "date_joined", "last_login"]

    def get_rol(self, obj):
        if obj.rol:
            return {"id_rol": obj.rol.id_rol, "nombre_rol": obj.rol.nombre_rol}
        return None

class RegisterSerializer(serializers.ModelSerializer):
    """Valida y crea usuarios nuevos. Acepta id_rol opcional y datos de direccion opcionales."""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    id_rol = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    direccion = DireccionSerializer(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            "id", "correo", "nombre", "apellido_paterno", "apellido_materno",
            "password", "password_confirm", "id_rol", "direccion"
        ]
        read_only_fields = ["id"]

    def validate_correo(self, value):
        if User.objects.filter(correo__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con ese correo.")
        return value

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        # extraer campos no pasados al modelo directo
        password = validated_data.pop("password")
        validated_data.pop("password_confirm", None)
        id_rol = validated_data.pop("id_rol", None)
        direccion_data = validated_data.pop("direccion", None)

        # crear objeto usuario (sin password aún)
        user = User(**validated_data)

        # asignar rol si viene
        if id_rol:
            try:
                rol = Rol.objects.get(id_rol=id_rol)
                user.rol = rol
            except Rol.DoesNotExist:
                # lanzar error si prefieres:
                # raise serializers.ValidationError({"id_rol":"Rol no existe."})
                pass

        # si viene direccion, crearla y asignar
        if direccion_data:
            direccion = Direccion.objects.create(**direccion_data)
            user.direccion = direccion

        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)
