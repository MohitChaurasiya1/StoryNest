from rest_framework import serializers
from django.db.models import Avg
from api.models import TeacherClass, ClassStudent, ChildProfile

class TeacherClassroomSerializer(serializers.ModelSerializer):
    student_count = serializers.IntegerField(read_only=True, source='active_students', default=0)

    class Meta:
        model = TeacherClass
        fields = [
            'id', 'name', 'grade_level', 'section', 'description', 
            'subject', 'academic_year', 'status', 'student_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at', 'student_count']


class ClassroomStudentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='child.id')
    name = serializers.CharField(source='child.name')
    avatar_url = serializers.CharField(source='child.avatar_url')
    
    # We can add mock stats or annotated stats here if needed
    reading_streak = serializers.SerializerMethodField()
    stories_completed = serializers.SerializerMethodField()
    average_progress = serializers.SerializerMethodField()

    class Meta:
        model = ClassStudent
        fields = [
            'id', 'name', 'avatar_url', 'status', 'enrolled_at',
            'reading_streak', 'stories_completed', 'average_progress'
        ]

    def get_reading_streak(self, obj):
        try:
            return obj.child.streak.current_streak
        except AttributeError:
            return 0
            
    def get_stories_completed(self, obj):
        # We can optimize this with annotations later, but for now we query
        return obj.child.reading_logs.filter(completed=True).count()
        
    def get_average_progress(self, obj):
        avg = obj.child.quiz_attempts.aggregate(avg=Avg('percentage'))['avg']
        return int(round(avg)) if avg else 0


class ContentCreatorSerializer(serializers.Serializer):
    type = serializers.CharField()
    name = serializers.CharField()

class LibraryContentCardSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField(allow_blank=True, required=False)
    cover_image = serializers.URLField(allow_blank=True, allow_null=True, required=False)
    grade = serializers.CharField(allow_blank=True, required=False)
    reading_level = serializers.CharField(allow_blank=True, required=False)
    genre = serializers.CharField(allow_blank=True, required=False)
    estimated_minutes = serializers.IntegerField(required=False)
    creator = ContentCreatorSerializer(required=False)
    status = serializers.CharField(required=False)
    created_at = serializers.DateTimeField()

from api.models import ClassAssignment, ClassAssignmentStudent

class ClassAssignmentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    content_id = serializers.SerializerMethodField()
    content_title = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()

    class Meta:
        model = ClassAssignment
        fields = [
            'id', 'title', 'assignment_type', 'description', 'instructions',
            'start_date', 'due_date', 'status', 'reading_level',
            'target_all_students', 'created_at', 'updated_at',
            'classroom_id', 'classroom_name', 'content_id', 'content_title', 'stats'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'status']

    def get_content_id(self, obj):
        if obj.assignment_type == 'story' and obj.story:
            return obj.story.id
        elif obj.assignment_type == 'quiz' and obj.quiz:
            return obj.quiz.id
        elif obj.assignment_type == 'lesson' and obj.lesson:
            return obj.lesson.id
        return None

    def get_content_title(self, obj):
        if obj.assignment_type == 'story' and obj.story:
            return obj.story.title_en
        elif obj.assignment_type == 'quiz' and obj.quiz:
            return obj.quiz.title
        elif obj.assignment_type == 'lesson' and obj.lesson:
            return obj.lesson.title
        return None

    def get_stats(self, obj):
        # We can dynamically get stats using the service if passed in context,
        # or calculate here directly for simplicity if it's already prefetched,
        # but to avoid N+1 queries, we should ideally fetch in bulk. 
        # For this prototype, querying here is acceptable but can be optimized.
        # Alternatively, if stats are passed in context or attached to object:
        if hasattr(obj, 'annotated_stats'):
            return obj.annotated_stats
            
        from .services.teacher_assignment_service import TeacherAssignmentService
        return TeacherAssignmentService.get_assignment_stats(obj)

class ClassAssignmentStudentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='child.id', read_only=True)
    name = serializers.CharField(source='child.name', read_only=True)
    avatar_url = serializers.CharField(source='child.avatar', read_only=True)

    class Meta:
        model = ClassAssignmentStudent
        fields = [
            'id', 'name', 'avatar_url', 'status', 'completion_percentage',
            'score', 'feedback', 'started_at', 'submitted_at', 'completed_at',
            'reviewed_at'
        ]

