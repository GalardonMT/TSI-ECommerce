# usuarios/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from .serializers import RegisterSerializer, UserSerializer, LoginSerializer

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}

class RegisterView(generics.CreateAPIView):
    """
    CreateAPIView para registro. Override create() para devolver tokens junto al user.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        # usa la lógica estándar de CreateAPIView para validar y guardar
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
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
