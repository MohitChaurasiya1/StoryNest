from rest_framework import serializers

class TeacherProgressOverviewSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    average_progress = serializers.IntegerField(allow_null=True)
    quiz_average = serializers.IntegerField(allow_null=True)
    assignment_completion = serializers.IntegerField(allow_null=True)
    active_readers = serializers.IntegerField()


class ReadingAnalyticsSerializer(serializers.Serializer):
    stories_started = serializers.IntegerField()
    stories_completed = serializers.IntegerField()
    reading_minutes = serializers.IntegerField()
    average_session_minutes = serializers.IntegerField()
    average_streak = serializers.IntegerField()
    trend = serializers.ListField(child=serializers.DictField())


class QuizAnalyticsSerializer(serializers.Serializer):
    average_score = serializers.IntegerField(allow_null=True)
    highest_score = serializers.IntegerField(allow_null=True)
    lowest_score = serializers.IntegerField(allow_null=True)
    completed = serializers.IntegerField()
    distribution = serializers.DictField()


class AssignmentAnalyticsSerializer(serializers.Serializer):
    assigned = serializers.IntegerField()
    completed = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    not_started = serializers.IntegerField()
    overdue = serializers.IntegerField()
    completion_percentage = serializers.IntegerField(allow_null=True)


class NeedsAttentionItemSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    avatar = serializers.CharField(allow_blank=True, allow_null=True)
    classroom_name = serializers.CharField()
    severity = serializers.CharField()
    reasons = serializers.ListField(child=serializers.CharField())


class StudentProgressSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    avatar = serializers.CharField(allow_blank=True, allow_null=True)
    classroom_name = serializers.CharField()
    progress = serializers.IntegerField(allow_null=True)
    quiz_avg = serializers.IntegerField(allow_null=True)
    assignment_completion = serializers.IntegerField(allow_null=True)
    status = serializers.CharField()
    risk_score = serializers.IntegerField(default=0)
    reasons = serializers.ListField(child=serializers.CharField(), default=list)

