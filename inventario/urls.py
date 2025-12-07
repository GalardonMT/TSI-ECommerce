from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductoViewSet, CategoriaViewSet # Importa la nueva vista

router = DefaultRouter()
router.register(r'producto', ProductoViewSet, basename='producto')
router.register(r'categoria', CategoriaViewSet, basename='categoria')

urlpatterns = [
    path('', include(router.urls)),
]