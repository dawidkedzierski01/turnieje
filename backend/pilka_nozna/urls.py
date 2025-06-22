from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TurniejViewSet,
    DruzynaViewSet,
    MeczViewSet,
    generuj_mecze,
    resetuj_mecze,
    zatwierdz_kolejke,
)

router = DefaultRouter()
router.register(r'turnieje', TurniejViewSet)
router.register(r'druzyny', DruzynaViewSet)
router.register(r'mecze', MeczViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('generuj-mecze/<int:turniej_id>/', generuj_mecze, name='generuj_mecze'),
    path('resetuj-mecze/<int:turniej_id>/', resetuj_mecze, name='resetuj_mecze'),
    path('zatwierdz-kolejke/<int:turniej_id>/', zatwierdz_kolejke, name='zatwierdz_kolejke'),
]
