from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializa la info basica de usuarios existentes"""
    class Meta:
        model = User
        fields = [
            "id_cuenta", "correo", "nombre", "apellido_paterno", "apellido_materno",
            "rut", "fecha_nacimiento", "telefono", "rol", "estado",
            "creado_en", "ultimo_login"
        ]
        read_only_fields = ["id_cuenta", "creado_en", "ultimo_login"]

class RegisterSerializer(serializers.ModelSerializer):
    """Valida y crea usuarios nuevos"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id_cuenta", "correo", "nombre", "apellido_paterno", "apellido_materno",
            "rut", "fecha_nacimiento", "telefono", "rol",
            "password", "password_confirm"
        ]
        read_only_fields = ["id_cuenta"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)   # muy importante: guarda hash, no texto plano
        user.save()
        return user
