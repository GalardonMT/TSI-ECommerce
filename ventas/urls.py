from django.urls import path
from .views import CarritoView

urlpatterns = [
    path('carrito/', CarritoView.as_view()),
]
