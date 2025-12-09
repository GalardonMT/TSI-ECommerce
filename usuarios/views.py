# usuarios/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from datetime import timedelta
import secrets
import logging

logger = logging.getLogger(__name__)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.db import IntegrityError

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    LoginSerializer,
    UpdateUserSerializer,
    get_tokens_for_user,
)
from .models import PasswordResetToken

User = get_user_model()

class PerfilUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        serializer = UpdateUserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Perfil actualizado correctamente"}, status=200)

        return Response(serializer.errors, status=400)


class RegisterView(generics.CreateAPIView):
    """
    CreateAPIView para registro. Override create() para devolver tokens junto al user.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = serializer.save()
        except IntegrityError as e:
            # devolver 400 en vez de 500 con mensaje legible
            return Response({"detail": "Error al guardar en la base de datos.", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        headers = self.get_success_headers(serializer.data)
        return Response({"user": user_data, "tokens": tokens}, status=status.HTTP_201_CREATED, headers=headers)

class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        correo = serializer.validated_data["correo"]
        password = serializer.validated_data["password"]

        user = authenticate(request, correo=correo, password=password)
        if user is None:
            return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({"detail": "Cuenta desactivada"}, status=status.HTTP_403_FORBIDDEN)

        # Log the user in (this triggers user_logged_in signal in standard setups)
        login(request, user)

        # Ensure last_login is stored in the database (explicit save in case signals are not connected)
        try:
            ts = timezone.now()
            user.last_login = ts
            user.save(update_fields=["last_login"])
            logger.debug("Updated last_login for user %s to %s", user.pk, ts)
        except Exception as exc:
            # do not block login if saving last_login fails
            logger.exception("Failed updating last_login for user %s: %s", getattr(user, 'pk', None), exc)

        # Re-fetch the user from DB to be sure the persisted value is readable
        try:
            refreshed = User.objects.get(pk=user.pk)
        except Exception:
            refreshed = user

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(refreshed).data

        return Response({
            "user": user_data,
            "tokens": tokens,
            "access": tokens.get("access"),
            "refresh": tokens.get("refresh"),
            "last_login_db": str(refreshed.last_login) if getattr(refreshed, 'last_login', None) else None,
        }, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        correo = request.data.get("correo") or request.data.get("email") or ""
        if not correo:
            return Response({"detail": "Correo requerido"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(correo__iexact=correo).first()
        # Always respond success to avoid leaking valid emails
        if not user:
            return Response({"detail": "Si el correo existe, enviaremos instrucciones"}, status=status.HTTP_200_OK)

        # Invalidate old tokens for this user
        PasswordResetToken.objects.filter(usuario=user, used=False, expires_at__lte=timezone.now()).update(used=True, used_at=timezone.now())

        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(minutes=30)
        PasswordResetToken.objects.create(usuario=user, token=token, expires_at=expires_at)

        frontend_base = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_base.rstrip('/')}/reset-password?token={token}"

        subject = "Recupera tu contraseña"
        message = (
            "Recibimos una solicitud para restablecer tu contraseña.\n"
            f"Usa este enlace (válido por 30 minutos): {reset_link}\n\n"
            "Si no solicitaste este cambio, ignora este mensaje."
        )

        send_mail(
            subject,
            message,
            getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@tsi-ecommerce.local'),
            [user.correo],
            fail_silently=True,
        )

        return Response({"detail": "Si el correo existe, enviaremos instrucciones"}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token_value = request.data.get("token")
        password = request.data.get("password")
        if not token_value or not password:
            return Response({"detail": "Token y contraseña son requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        token_obj = (
            PasswordResetToken.objects.select_related("usuario")
            .filter(token=token_value, used=False, expires_at__gt=timezone.now())
            .first()
        )
        if not token_obj:
            return Response({"detail": "Token inválido o expirado"}, status=status.HTTP_400_BAD_REQUEST)

        user = token_obj.usuario
        user.set_password(password)
        user.save(update_fields=["password"])

        token_obj.used = True
        token_obj.used_at = timezone.now()
        token_obj.save(update_fields=["used", "used_at"])

        # Invalidate other active tokens for this user
        PasswordResetToken.objects.filter(usuario=user, used=False).update(used=True, used_at=timezone.now())

        return Response({"detail": "Contraseña actualizada"}, status=status.HTTP_200_OK)


from rest_framework import viewsets
from rest_framework import permissions as drf_permissions


class IsSuperUser(drf_permissions.BasePermission):
    """Allow access only to superusers."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


class IsStaffOrSuper(drf_permissions.BasePermission):
    """Allow access to staff or superusers."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser))


class UserViewSet(viewsets.ModelViewSet):
    """A simple ViewSet for listing, creating and managing users.

    - list/retrieve: allowed for staff or superusers
    - create/update/destroy: allowed only for superusers
    """
    queryset = User.objects.all().order_by('id')

    def get_serializer_class(self):
        # Use RegisterSerializer for creation to allow password fields
        if self.action == 'create':
            return RegisterSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            permission_classes = [drf_permissions.IsAuthenticated, IsSuperUser]
        else:
            permission_classes = [drf_permissions.IsAuthenticated, IsStaffOrSuper]
        return [perm() for perm in permission_classes]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # bloquear modificación de la propia cuenta
        if instance.pk == request.user.pk:
            return Response({"detail": "No puedes modificar tu propia cuenta desde este panel."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        # bloquear convertir no-staff a staff o superuser
        if not instance.is_staff and serializer.validated_data.get('is_staff'):
            return Response({"detail": "No se permite convertir un usuario no-staff a staff."}, status=status.HTTP_400_BAD_REQUEST)
        if not instance.is_staff and serializer.validated_data.get('is_superuser'):
            return Response({"detail": "No se permite convertir un usuario no-staff a superuser."}, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response(UserSerializer(instance).data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.pk == request.user.pk:
            return Response({"detail": "No puedes modificar tu propia cuenta desde este panel."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if not instance.is_staff and serializer.validated_data.get('is_staff'):
            return Response({"detail": "No se permite convertir un usuario no-staff a staff."}, status=status.HTTP_400_BAD_REQUEST)
        if not instance.is_staff and serializer.validated_data.get('is_superuser'):
            return Response({"detail": "No se permite convertir un usuario no-staff a superuser."}, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response(UserSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.pk == request.user.pk:
            return Response({"detail": "No puedes eliminar tu propia cuenta."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)



class LogoutAPIView(APIView):
    """
    Logout: recibe { refresh } en body y lo blacklistea para invalidar futuros refresh.
    Requiere agregar 'rest_framework_simplejwt.token_blacklist' en INSTALLED_APPS y migrar.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Se requiere el token refresh."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()  # requiere token_blacklist activado en INSTALLED_APPS
            return Response({"detail": "Logout exitoso."}, status=status.HTTP_200_OK)
        except (TokenError, InvalidToken) as e:
            return Response({"detail": "Refresh token inválido o ya fue invalidado."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)
