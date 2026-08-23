from rest_framework import serializers

class TeacherProfileUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    school_name = serializers.CharField(required=False, allow_blank=True)
    grade_level = serializers.CharField(required=False, allow_blank=True)
    subject = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    avatar = serializers.CharField(required=False, allow_blank=True)


class TeacherPreferencesUpdateSerializer(serializers.Serializer):
    theme_preference = serializers.ChoiceField(choices=['light', 'dark', 'system'], required=False)
    preferred_language = serializers.CharField(required=False, allow_blank=True)


class TeacherNotificationUpdateSerializer(serializers.Serializer):
    email_notifications = serializers.BooleanField(required=False)
    assignment_notifications = serializers.BooleanField(required=False)
    student_progress_alerts = serializers.BooleanField(required=False)
    system_updates = serializers.BooleanField(required=False)
