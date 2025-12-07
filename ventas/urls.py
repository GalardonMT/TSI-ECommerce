from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarritoView, ReservaAdminViewSet

router = DefaultRouter()
router.register(r"reservas-admin", ReservaAdminViewSet, basename="reservas-admin")

urlpatterns = [
    path('carrito/', CarritoView.as_view()),
    path('', include(router.urls)),
]
