from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    StoryViewSet,
    generate_story_api,
)
from .parent_views import (
    RegisterView,
    MeView,
    ChangePasswordView,
    UpdateProfileView,
    DeleteAccountView,
    ParentProfileView,
    ChildProfileViewSet,
    ParentDashboardView,
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
    ForgotPasswordView,
    ResetPasswordView,
    ChildDashboardView,
    ChildInsightsView,
    ReadingProgressView,
    ReadingLogViewSet,
)
from .teacher_v2_views import (
    TeacherDashboardAPIView,
    TeacherClassroomListCreateView,
    TeacherClassroomDetailView,
    TeacherClassroomArchiveView,
    TeacherClassroomStudentsView,
    TeacherClassroomStudentDetailView,
    TeacherStudentReadingLogView,
    TeacherStudentReadingLogDetailView,
    TeacherStudentAssignmentsView,
    TeacherStudentCertificatesView,
    TeacherStudentCertificateDetailView,
    TeacherGlobalStudentSearchView,
    TeacherStudentCreateView,
    TeacherLibraryListView,
    TeacherLibraryPreviewView,
    TeacherAssignmentListCreateView,
    TeacherAssignmentDetailView,
    TeacherAssignmentPublishView,
    TeacherAssignmentArchiveView,
    TeacherAssignmentDuplicateView,
    TeacherAssignmentRecipientsView,
)
from .teacher_progress_views import (
    TeacherProgressOverviewView,
    TeacherReadingAnalyticsView,
    TeacherQuizAnalyticsView,
    TeacherAssignmentAnalyticsView,
    TeacherNeedsAttentionView,
    TeacherStudentProgressListView,
    TeacherStudentProgressDetailView,
    TeacherProgressExportView,
)
from .teacher_settings_views import (
    TeacherSettingsAllView,
    TeacherSettingsProfileView,
    TeacherSettingsPreferencesView,
    TeacherSettingsNotificationsView,
)
from .teacher_story_views import (
    TeacherStoryGenerateView,
    TeacherStoryListCreateView,
    TeacherStoryDetailView,
    TeacherStoryPublishView,
)
from .parent_views_extended import (
    StoryApprovalViewSet, NotificationViewSet, ChildGoalViewSet,
    ReadingAnalyticsView, ReadingStreakView, ReadingScheduleViewSet,
    StoryRatingViewSet, RewardShopItemViewSet, RewardPurchaseView,
    ChildActivityTimelineView, ChildGrowthDashboardView,
    MultiChildComparisonView, AIInsightsView, AIStoryRecommendationView,
    GlobalSearchView, ReportExportView,
)
from .admin_views import (
    CustomTokenObtainPairView,
    AdminDashboardStatsView,
    AdminActivityLogListView,
    AdminUserListView,
    AdminUserDetailView,
    AdminUserToggleActiveView,
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


urlpatterns = [
    # Story endpoints
    path('stories/generate/', generate_story_api, name='generate_story'),

    # Admin Module Endpoints
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin_stats'),
    path('admin/logs/', AdminActivityLogListView.as_view(), name='admin_activity_logs'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_users'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<int:user_id>/toggle/', AdminUserToggleActiveView.as_view(), name='admin_user_toggle'),

    # Auth JWT & Profile endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/me/', MeView.as_view(), name='auth_me'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('auth/update-profile/', UpdateProfileView.as_view(), name='auth_update_profile'),
    path('auth/delete-account/', DeleteAccountView.as_view(), name='auth_delete_account'),

    path('parent/auth/change-password/', ChangePasswordView.as_view(), name='parent_change_password'),
    path('parent/auth/update-profile/', UpdateProfileView.as_view(), name='parent_update_profile'),
    path('parent/auth/delete-account/', DeleteAccountView.as_view(), name='parent_delete_account'),
    path('parent/profile/', ParentProfileView.as_view(), name='parent_profile'),

    # Teacher Module Endpoints
    path('teacher/dashboard/', TeacherDashboardAPIView.as_view(), name='teacher_dashboard_v2'),
    path('teacher/classrooms/', TeacherClassroomListCreateView.as_view(), name='teacher_classrooms_list_create'),
    path('teacher/classrooms/<int:classroom_id>/', TeacherClassroomDetailView.as_view(), name='teacher_classroom_detail'),
    path('teacher/classrooms/<int:classroom_id>/archive/', TeacherClassroomArchiveView.as_view(), name='teacher_classroom_archive'),
    path('teacher/classrooms/<int:classroom_id>/students/', TeacherClassroomStudentsView.as_view(), name='teacher_classroom_students'),
    path('teacher/classrooms/<int:classroom_id>/students/<int:student_id>/', TeacherClassroomStudentDetailView.as_view(), name='teacher_classroom_student_detail'),
    path('teacher/classrooms/<int:classroom_id>/students/<int:student_id>/dashboard/', TeacherClassroomStudentDetailView.as_view(), name='teacher_classroom_student_dashboard'),
    path('teacher/classrooms/<int:classroom_id>/students/<int:student_id>/reading-logs/', TeacherStudentReadingLogView.as_view(), name='teacher_student_reading_logs'),
    path('teacher/classrooms/<int:classroom_id>/students/<int:student_id>/reading-logs/<int:log_id>/', TeacherStudentReadingLogDetailView.as_view(), name='teacher_student_reading_log_detail'),
    path('teacher/classrooms/<int:classroom_id>/students/<int:student_id>/assignments/', TeacherStudentAssignmentsView.as_view(), name='teacher_student_assignments'),
    path('teacher/classrooms/<int:classroom_id>/students/<int:student_id>/certificates/', TeacherStudentCertificatesView.as_view(), name='teacher_student_certificates'),
    path('teacher/classrooms/<int:classroom_id>/students/<int:student_id>/certificates/<int:cert_id>/', TeacherStudentCertificateDetailView.as_view(), name='teacher_student_certificate_detail'),
    path('teacher/students/search/', TeacherGlobalStudentSearchView.as_view(), name='teacher_global_student_search'),
    path('teacher/students/create/', TeacherStudentCreateView.as_view(), name='teacher_student_create'),
    path('teacher/students/', TeacherStudentCreateView.as_view(), name='teacher_students'),

    # Teacher Library & Stories Endpoints
    path('teacher/library/', TeacherLibraryListView.as_view(), name='teacher-library-list'),
    path('teacher/library/<str:content_type>/<int:content_id>/', TeacherLibraryPreviewView.as_view(), name='teacher-library-preview'),
    path('teacher/stories/generate/', TeacherStoryGenerateView.as_view(), name='teacher_story_generate'),
    path('teacher/stories/', TeacherStoryListCreateView.as_view(), name='teacher_stories_list_create'),
    path('teacher/stories/<int:story_id>/', TeacherStoryDetailView.as_view(), name='teacher_story_detail'),
    path('teacher/stories/<int:story_id>/publish/', TeacherStoryPublishView.as_view(), name='teacher_story_publish'),

    # Teacher Assignments Endpoints
    path('teacher/assignments/', TeacherAssignmentListCreateView.as_view(), name='teacher_assignments_list_create'),
    path('teacher/assignments/<int:assignment_id>/', TeacherAssignmentDetailView.as_view(), name='teacher_assignment_detail'),
    path('teacher/assignments/<int:assignment_id>/publish/', TeacherAssignmentPublishView.as_view(), name='teacher_assignment_publish'),
    path('teacher/assignments/<int:assignment_id>/archive/', TeacherAssignmentArchiveView.as_view(), name='teacher_assignment_archive'),
    path('teacher/assignments/<int:assignment_id>/duplicate/', TeacherAssignmentDuplicateView.as_view(), name='teacher_assignment_duplicate'),
    path('teacher/assignments/<int:assignment_id>/recipients/', TeacherAssignmentRecipientsView.as_view(), name='teacher_assignment_recipients'),

    # Teacher Progress & Reports Endpoints
    path('teacher/progress/overview/', TeacherProgressOverviewView.as_view(), name='teacher_progress_overview'),
    path('teacher/progress/reading/', TeacherReadingAnalyticsView.as_view(), name='teacher_progress_reading'),
    path('teacher/progress/quizzes/', TeacherQuizAnalyticsView.as_view(), name='teacher_progress_quizzes'),
    path('teacher/progress/assignments/', TeacherAssignmentAnalyticsView.as_view(), name='teacher_progress_assignments'),
    path('teacher/progress/attention/', TeacherNeedsAttentionView.as_view(), name='teacher_progress_attention'),
    path('teacher/progress/students/', TeacherStudentProgressListView.as_view(), name='teacher_progress_student_list'),
    path('teacher/progress/students/<int:student_id>/', TeacherStudentProgressDetailView.as_view(), name='teacher_progress_student_detail'),
    path('teacher/progress/export/', TeacherProgressExportView.as_view(), name='teacher_progress_export'),

    # Teacher Settings & Profile Endpoints
    path('teacher/settings/all/', TeacherSettingsAllView.as_view(), name='teacher_settings_all'),
    path('teacher/settings/profile/', TeacherSettingsProfileView.as_view(), name='teacher_settings_profile'),
    path('teacher/settings/preferences/', TeacherSettingsPreferencesView.as_view(), name='teacher_settings_preferences'),
    path('teacher/settings/notifications/', TeacherSettingsNotificationsView.as_view(), name='teacher_settings_notifications'),

    # Forgot/Reset Password (public, no auth required)
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset_password'),

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
