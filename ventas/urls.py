from django.urls import path
from .views import CarritoView, PedidosUsuarioView

urlpatterns = [
    path('carrito/', CarritoView.as_view()),
    path('pedidos/', PedidosUsuarioView.as_view()),
]
