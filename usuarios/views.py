# usuarios/views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
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
    """
    Login: espera { correo, password } y devuelve access + refresh + datos usuario.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        correo = serializer.validated_data["correo"]
        password = serializer.validated_data["password"]

        # autenticación manual (recomendado cuando USERNAME_FIELD != 'username')
        user = User.objects.filter(correo__iexact=correo).first()
        if user is None or not user.check_password(password):
            return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({"detail": "Cuenta desactivada"}, status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        return Response({"user": user_data, "tokens": tokens}, status=status.HTTP_200_OK)

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
