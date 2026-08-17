from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Q
from .models import UserActivityLog, Story, ChildProfile, ReadingLog
from .serializers import (
    UserSerializer,
    UserActivityLogSerializer,
    CustomTokenObtainPairSerializer
)
from .permissions import IsAdminRole

User = get_user_model()


def log_user_activity(user, action, request=None, details=''):
    """Helper function to record user activity log."""
    ip_address = None
    user_agent = None

    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0].strip()
        else:
            ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')

    UserActivityLog.objects.create(
        user=user,
        action=action,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details
    )


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT Token Login endpoint that accepts username or email
    and records a LOGIN entry in UserActivityLog upon success.
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            username_or_email = request.data.get('username', '').strip()
            user = User.objects.filter(
                Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
            ).first()
            if user:
                log_user_activity(user, 'LOGIN', request=request, details='JWT Authentication successful')
        return response


class AdminDashboardStatsView(APIView):
    """
    API view returning high-level KPIs and stats for the Admin Dashboard.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        now = timezone.now()
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_week = start_of_today - timezone.timedelta(days=now.weekday())

        total_users = User.objects.count()
        new_users_today = User.objects.filter(date_joined__gte=start_of_today).count()
        new_users_this_week = User.objects.filter(date_joined__gte=start_of_week).count()

        total_parents = User.objects.filter(role=User.Role.PARENT).count()
        total_teachers = User.objects.filter(role=User.Role.TEACHER).count()
        total_admins = User.objects.filter(role=User.Role.ADMIN).count()

        logins_today = UserActivityLog.objects.filter(
            action='LOGIN',
            timestamp__gte=start_of_today
        ).values('user').distinct().count()

        total_stories = Story.objects.count()
        total_children = ChildProfile.objects.count()
        total_reading_logs = ReadingLog.objects.count()

        return Response({
            'total_users': total_users,
            'new_users_today': new_users_today,
            'new_users_this_week': new_users_this_week,
            'logins_today': logins_today,
            'roles_breakdown': {
                'parents': total_parents,
                'teachers': total_teachers,
                'admins': total_admins,
            },
            'platform_stats': {
                'total_stories': total_stories,
                'total_children': total_children,
                'total_reading_logs': total_reading_logs,
            }
        })


class AdminActivityLogListView(APIView):
    """
    API view for Admin to inspect user activity (Logins, Signups, Password Resets).
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        logs = UserActivityLog.objects.select_related('user').all()

        # Filtering by action (LOGIN, SIGNUP, etc.)
        action = request.query_params.get('action')
        if action:
            logs = logs.filter(action=action)

        # Filtering by search term (username, email, or details)
        search = request.query_params.get('search')
        if search:
            search = search.strip()
            logs = logs.filter(
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(details__icontains=search)
            )

        # Limit to recent logs (default 100)
        logs = logs[:100]
        serializer = UserActivityLogSerializer(logs, many=True)
        return Response(serializer.data)


class AdminUserListView(APIView):
    """
    API view for Admin to view and manage registered users.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')

        role = request.query_params.get('role')
        if role and role.upper() in ['PARENT', 'TEACHER', 'ADMIN']:
            users = users.filter(role=role.upper())

        search = request.query_params.get('search')
        if search:
            search = search.strip()
            users = users.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class AdminUserToggleActiveView(APIView):
    """
    API view for Admin to activate/deactivate a user.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user.pk == request.user.pk:
            return Response({'detail': 'You cannot deactivate your own admin account.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = not user.is_active
        user.save()

        log_user_activity(
            request.user,
            'USER_TOGGLE',
            request=request,
            details=f"{'Activated' if user.is_active else 'Deactivated'} user {user.username}"
        )

        return Response({
            'detail': f"User {user.username} {'activated' if user.is_active else 'deactivated'} successfully.",
            'user': UserSerializer(user).data
        })
