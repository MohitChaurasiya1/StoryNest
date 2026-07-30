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
    ChangePasswordView,
    UpdateProfileView,
    DeleteAccountView,
    ParentProfileView,
    ChildProfileViewSet,
    ParentDashboardView,
    ChildDashboardView,
    ChildInsightsView,
    ReadingLogViewSet,
    ReadingProgressView,
    ParentStoryLibraryView,
    ToggleFavouriteView,
    ChildStoriesView,
    QuizDetailView,
    QuizSubmitView,
    QuizHistoryView,
    ChildAchievementsView,
    ParentNoteViewSet,
    CertificateListView,
    IssueCertificateView,
    FamilyReadingLogsView,
)
from .teacher_views import (
    TeacherDashboardView,
    TeacherAnalysisView,
    TeacherInboxViewSet,
    TeacherLessonViewSet,
    TeacherStudentViewSet,
    TeacherSettingsView,
)

from .parent_views_extended import (
    StoryApprovalViewSet, NotificationViewSet, ChildGoalViewSet,
    ReadingAnalyticsView, ReadingStreakView, ReadingScheduleViewSet,
    StoryRatingViewSet, RewardShopItemViewSet, RewardPurchaseView,
    ChildActivityTimelineView, ChildGrowthDashboardView,
    MultiChildComparisonView, AIInsightsView, AIStoryRecommendationView,
    GlobalSearchView, ReportExportView,
)

router = DefaultRouter()
router.register(r'stories', StoryViewSet, basename='story')
router.register(r'parent/children', ChildProfileViewSet, basename='parent-children')
router.register(r'parent/notes', ParentNoteViewSet, basename='parent-notes')
router.register(r'parent/approvals', StoryApprovalViewSet, basename='parent-approvals')
router.register(r'parent/notifications', NotificationViewSet, basename='parent-notifications')
router.register(r'parent/goals', ChildGoalViewSet, basename='parent-goals')
router.register(r'parent/schedules', ReadingScheduleViewSet, basename='parent-schedules')
router.register(r'parent/ratings', StoryRatingViewSet, basename='parent-ratings')
router.register(r'parent/rewards/shop', RewardShopItemViewSet, basename='reward-shop')
router.register(r'teacher/inbox', TeacherInboxViewSet, basename='teacher-inbox')
router.register(r'teacher/lessons', TeacherLessonViewSet, basename='teacher-lessons')
router.register(r'teacher/students', TeacherStudentViewSet, basename='teacher-students')

urlpatterns = [
    # Story endpoints
    path('stories/generate/', generate_story_api, name='generate_story'),

    # Teacher Module Endpoints
    path('teacher/dashboard/', TeacherDashboardView.as_view(), name='teacher_dashboard'),
    path('teacher/analysis/', TeacherAnalysisView.as_view(), name='teacher_analysis'),
    path('teacher/settings/', TeacherSettingsView.as_view(), name='teacher_settings'),

    # Auth JWT & Profile endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', MeView.as_view(), name='auth_me'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('parent/auth/change-password/', ChangePasswordView.as_view(), name='parent_change_password'),
    path('parent/auth/update-profile/', UpdateProfileView.as_view(), name='parent_update_profile'),
    path('parent/auth/delete-account/', DeleteAccountView.as_view(), name='parent_delete_account'),
    path('parent/profile/', ParentProfileView.as_view(), name='parent_profile'),

    # Parent Dashboard & Library
    path('parent/dashboard/', ParentDashboardView.as_view(), name='parent_dashboard'),
    path('parent/library/', ParentStoryLibraryView.as_view(), name='parent_library'),
    path('parent/stories/<int:story_id>/favourite/', ToggleFavouriteView.as_view(), name='toggle_favourite'),
    path('parent/family-logs/', FamilyReadingLogsView.as_view(), name='family_reading_logs'),

    # Child-specific Endpoints
    path('parent/children/<int:id>/dashboard/', ChildDashboardView.as_view(), name='child_dashboard'),
    path('parent/children/<int:id>/insights/', ChildInsightsView.as_view(), name='child_insights'),
    path('parent/children/<int:id>/stories/', ChildStoriesView.as_view(), name='child_stories'),
    path('parent/children/<int:id>/achievements/', ChildAchievementsView.as_view(), name='child_achievements'),
    
    # Extended Feature Endpoints
    path('parent/children/<int:child_id>/analytics/', ReadingAnalyticsView.as_view(), name='reading_analytics'),
    path('parent/children/<int:child_id>/streak/', ReadingStreakView.as_view(), name='reading_streak'),
    path('parent/children/<int:child_id>/rewards/', RewardPurchaseView.as_view(), name='reward_purchase'),
    path('parent/children/<int:child_id>/timeline/', ChildActivityTimelineView.as_view(), name='child_timeline'),
    path('parent/children/<int:child_id>/growth/', ChildGrowthDashboardView.as_view(), name='child_growth'),
    path('parent/children/<int:child_id>/ai-insights/', AIInsightsView.as_view(), name='child_ai_insights'),
    path('parent/children/<int:child_id>/recommendations/', AIStoryRecommendationView.as_view(), name='child_recommendations'),
    path('parent/comparison/', MultiChildComparisonView.as_view(), name='multi_child_comparison'),
    path('parent/search/', GlobalSearchView.as_view(), name='global_search'),
    path('parent/reports/export/', ReportExportView.as_view(), name='report_export'),

    # Progress & Quizzes
    path('parent/children/<int:child_id>/progress/<int:story_id>/', ReadingProgressView.as_view(), name='child_reading_progress'),
    path('parent/stories/<int:story_id>/quiz/', QuizDetailView.as_view(), name='quiz_detail'),
    path('parent/stories/<int:story_id>/quiz/submit/', QuizSubmitView.as_view(), name='quiz_submit'),
    path('parent/children/<int:child_id>/quizzes/history/', QuizHistoryView.as_view(), name='quiz_history'),

    # Certificates & Logs
    path('parent/certificates/', CertificateListView.as_view(), name='certificate_list'),
    path('parent/certificates/issue/', IssueCertificateView.as_view(), name='issue_certificate'),
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


