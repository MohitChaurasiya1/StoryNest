from rest_framework import serializers

class TeacherProgressOverviewSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    average_progress = serializers.IntegerField()
    quiz_average = serializers.IntegerField()
    assignment_completion = serializers.IntegerField()
    active_readers = serializers.IntegerField()


class ReadingAnalyticsSerializer(serializers.Serializer):
    stories_started = serializers.IntegerField()
    stories_completed = serializers.IntegerField()
    reading_minutes = serializers.IntegerField()
    average_session_minutes = serializers.IntegerField()
    average_streak = serializers.IntegerField()
    trend = serializers.ListField(child=serializers.DictField())


class QuizAnalyticsSerializer(serializers.Serializer):
    average_score = serializers.IntegerField()
    highest_score = serializers.IntegerField()
    lowest_score = serializers.IntegerField()
    completed = serializers.IntegerField()
    distribution = serializers.DictField()


class AssignmentAnalyticsSerializer(serializers.Serializer):
    assigned = serializers.IntegerField()
    completed = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    not_started = serializers.IntegerField()
    overdue = serializers.IntegerField()
    completion_percentage = serializers.IntegerField()


class NeedsAttentionItemSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    avatar = serializers.CharField()
    classroom_name = serializers.CharField()
    severity = serializers.CharField()
    reasons = serializers.ListField(child=serializers.CharField())


class StudentProgressSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    avatar = serializers.CharField()
    classroom_name = serializers.CharField()
    progress = serializers.IntegerField()
    quiz_avg = serializers.IntegerField()
    assignment_completion = serializers.IntegerField()
    status = serializers.CharField()
