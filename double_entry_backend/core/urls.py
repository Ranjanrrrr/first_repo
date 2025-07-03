from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, JournalEntryViewSet,RegisterView

router = DefaultRouter()
router.register('accounts', AccountViewSet)
router.register('entries', JournalEntryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
]
