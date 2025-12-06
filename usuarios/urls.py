# usuarios/urls.py
from django.urls import path
from .views import RegisterView, LoginAPIView, LogoutAPIView, me
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginAPIView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutAPIView.as_view(), name="auth-logout"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", me, name="auth-me"),
]

# Register users viewset for admin management
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns += router.urls
