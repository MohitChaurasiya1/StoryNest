from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.exceptions import PermissionDenied
from api.models import User
from .services.teacher_settings_service import TeacherSettingsService
from .teacher_settings_serializers import (
    TeacherProfileUpdateSerializer,
    TeacherPreferencesUpdateSerializer,
    TeacherNotificationUpdateSerializer
)

class BaseTeacherSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def check_teacher_permission(self, request):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to access teacher settings.")


class TeacherSettingsAllView(BaseTeacherSettingsView):
    def get(self, request):
        self.check_teacher_permission(request)
        settings_data = TeacherSettingsService.get_settings(request.user)
        return Response(settings_data)


class TeacherSettingsProfileView(BaseTeacherSettingsView):
    def get(self, request):
        self.check_teacher_permission(request)
        settings_data = TeacherSettingsService.get_settings(request.user)
        return Response(settings_data['profile'])

    def patch(self, request):
        self.check_teacher_permission(request)
        serializer = TeacherProfileUpdateSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            updated = TeacherSettingsService.update_profile(request.user, serializer.validated_data)
            return Response(updated)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherSettingsPreferencesView(BaseTeacherSettingsView):
    def get(self, request):
        self.check_teacher_permission(request)
        settings_data = TeacherSettingsService.get_settings(request.user)
        return Response(settings_data['preferences'])

    def patch(self, request):
        self.check_teacher_permission(request)
        serializer = TeacherPreferencesUpdateSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            updated = TeacherSettingsService.update_preferences(request.user, serializer.validated_data)
            return Response(updated)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherSettingsNotificationsView(BaseTeacherSettingsView):
    def get(self, request):
        self.check_teacher_permission(request)
        settings_data = TeacherSettingsService.get_settings(request.user)
        return Response(settings_data['notifications'])

    def patch(self, request):
        self.check_teacher_permission(request)
        serializer = TeacherNotificationUpdateSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            updated = TeacherSettingsService.update_notifications(request.user, serializer.validated_data)
            return Response(updated)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
