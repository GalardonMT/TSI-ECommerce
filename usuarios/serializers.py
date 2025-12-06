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
            "region", "depto_oficina"
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
    # Flags opcionales para creación vía admin (superuser); ignorados en registro público.
    is_staff = serializers.BooleanField(write_only=True, required=False)
    is_superuser = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id", "correo", "nombre", "apellido_paterno", "apellido_materno",
            "rut", "telefono", "password", "password_confirm", "id_rol", "direccion",
            "is_staff", "is_superuser"
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
        password = validated_data.pop("password")
        validated_data.pop("password_confirm", None)
        id_rol = validated_data.pop("id_rol", None)
        direccion_data = validated_data.pop("direccion", None)
        staff_flag = bool(validated_data.pop("is_staff", False))
        super_flag = bool(validated_data.pop("is_superuser", False))

        user = User(**validated_data)

        if id_rol:
            try:
                rol = Rol.objects.get(id_rol=id_rol)
                user.rol = rol
            except Rol.DoesNotExist:
                pass

        if direccion_data:
            direccion = Direccion.objects.create(**direccion_data)
            user.direccion = direccion

        user.set_password(password)
        user.save()

        # Si la creación la hace un superuser (vía admin), aplicar flags explícitos sin forzar staff.
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated and request.user.is_superuser:
            update_fields = []
            if staff_flag:
                user.is_staff = True
                update_fields.append("is_staff")
            if super_flag:
                user.is_superuser = True
                # superuser implica staff
                if not user.is_staff:
                    user.is_staff = True
                    if "is_staff" not in update_fields:
                        update_fields.append("is_staff")
                update_fields.append("is_superuser")
            if update_fields:
                user.save(update_fields=update_fields)
        # Registro público: se ignoran flags aunque vengan manipulados.
        return user


class LoginSerializer(serializers.Serializer):
    correo = serializers.EmailField()
    password = serializers.CharField(write_only=True)
