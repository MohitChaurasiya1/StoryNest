from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import StoryViewSet, generate_story_api
from .parent_views import (
    RegisterView,
    MeView,
    ChildProfileViewSet,
    ChildDashboardView,
    ChildInsightsView,
    ReadingLogViewSet,
    ChildStoriesView,
    ChildAchievementsView,
)

router = DefaultRouter()
router.register(r'stories', StoryViewSet, basename='story')
router.register(r'parent/children', ChildProfileViewSet, basename='parent-children')

urlpatterns = [
    # Story endpoints
    path('stories/generate/', generate_story_api, name='generate_story'),

    # Auth JWT endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', MeView.as_view(), name='auth_me'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Parent Module specific endpoints
    path('parent/children/<int:id>/dashboard/', ChildDashboardView.as_view(), name='child_dashboard'),
    path('parent/children/<int:id>/insights/', ChildInsightsView.as_view(), name='child_insights'),
    path('parent/children/<int:id>/stories/', ChildStoriesView.as_view(), name='child_stories'),
    path('parent/children/<int:id>/achievements/', ChildAchievementsView.as_view(), name='child_achievements'),
    path(
        'parent/children/<int:child_id>/reading-logs/',
        ReadingLogViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='child_reading_logs'
    ),
    path(
        'parent/children/<int:child_id>/reading-logs/<int:pk>/',
        ReadingLogViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}),
        name='child_reading_log_detail'
    ),

    # Standard DRF Router URLs
    path('', include(router.urls)),
]
