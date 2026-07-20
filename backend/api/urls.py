from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoryViewSet, generate_story_api

router = DefaultRouter()
router.register(r'stories', StoryViewSet, basename='story')

urlpatterns = [
    path('stories/generate/', generate_story_api, name='generate_story'),
    path('', include(router.urls)),
]
