import re
from rest_framework import serializers
from .models import (
    User, ParentProfile, ChildProfile, Story, StoryPage,
    ReadingLog, ReadingProgress, ReadingSession,
    Quiz, QuizQuestion, QuizAttempt,
    Achievement, ChildAchievement,
    ParentNote, Certificate, StudentReport, FavouriteStory,
    TeacherProfile, TeacherClass, ClassStudent, ClassAssignment, ClassAssignmentStudent, Lesson, LessonSubmission, TeacherMessage,
    StoryApproval, Notification, ChildGoal, ReadingStreak,
    ReadingSchedule, StoryRating, RewardShopItem, RewardPurchase,
    PasswordResetOTP, UserActivityLog, TeacherEvent, TeacherSavedStory,
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Q




class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "phone", "is_active", "date_joined", "last_login"]
        read_only_fields = ["id", "date_joined", "last_login"]


class UserRegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=6, style={'input_type': 'password'})
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role", "phone", "first_name", "last_name"]

    def validate_role(self, value):
        if value == User.Role.ADMIN or str(value).upper() == 'ADMIN':
            raise serializers.ValidationError("Public registration as Admin is not allowed.")
        return value

    def validate_username(self, value):
        value = value.strip()
        if not re.match(r'^[a-zA-Z0-9_-]+$', value):
            raise serializers.ValidationError("Username can only contain letters, numbers, underscores (_), and hyphens (-). Special characters like %^&*() are not allowed.")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        value = value.strip().lower()
        strict_email_regex = r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(strict_email_regex, value):
            raise serializers.ValidationError("Invalid email format. Email can only contain letters, numbers, dots, underscores, and hyphens (e.g. user@example.com). Symbols like $%^&* are not allowed.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with that email address already exists.")
        return value

    def validate_first_name(self, value):
        if value:
            value = value.strip()
            if not re.match(r'^[a-zA-Z\s\'-]+$', value):
                raise serializers.ValidationError("First name can only contain alphabetic letters.")
        return value

    def validate_last_name(self, value):
        if value:
            value = value.strip()
            if not re.match(r'^[a-zA-Z\s\'-]+$', value):
                raise serializers.ValidationError("Last name can only contain alphabetic letters.")
        return value

    def validate_phone(self, value):
        if value:
            value = value.strip()
            digits = re.sub(r'\D', '', value)
            if len(digits) < 10 or len(digits) > 15:
                raise serializers.ValidationError("Phone number must contain between 10 and 15 digits.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.PARENT),
            phone=validated_data.get('phone', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        if user.role == User.Role.PARENT:
            ParentProfile.objects.get_or_create(user=user)
        elif user.role == User.Role.TEACHER:
            TeacherProfile.objects.get_or_create(user=user)
        return user



class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)
    new_password = serializers.CharField(required=True, min_length=6)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Token Serializer that accepts username OR email as login credential.
    """
    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field)
        password = attrs.get('password')

        if username_or_email and password:
            user = User.objects.filter(
                Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
            ).first()
            if user:
                attrs[self.username_field] = user.username

        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class UserActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    user_role = serializers.ReadOnlyField(source='user.role')
    first_name = serializers.ReadOnlyField(source='user.first_name')
    last_name = serializers.ReadOnlyField(source='user.last_name')

    class Meta:
        model = UserActivityLog
        fields = [
            'id', 'user', 'username', 'email', 'user_role',
            'first_name', 'last_name', 'action', 'ip_address',
            'user_agent', 'details', 'timestamp'
        ]



class ParentProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    email = serializers.CharField(source='user.email', required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ParentProfile
        fields = [
            "id", "username", "first_name", "last_name", "email", "phone",
            "bio", "avatar", "address", "city", "state", "country", "postal_code",
            "preferred_language", "theme_preference",
            "email_notifications", "weekly_reports", "settings",
            "created_at"
        ]
        read_only_fields = ["id", "created_at"]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            if 'email' in user_data:
                user.email = user_data['email']
            user.save()

        if 'phone' in validated_data and validated_data['phone']:
            instance.user.phone = validated_data['phone']
            instance.user.save()

        return super().update(instance, validated_data)


class ChildProfileSerializer(serializers.ModelSerializer):
    parent = serializers.ReadOnlyField(source='parent.username')
    stories_read = serializers.SerializerMethodField()
    quiz_average = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = ChildProfile
        fields = [
            "id", "parent", "name", "age", "dob", "gender",
            "grade_level", "preferred_language",
            "interests", "favourite_colour", "favourite_animal",
            "reading_level", "learning_goals",
            "avatar", "created_at", "updated_at",
            "stories_read", "quiz_average", "completion_percentage",
        ]
        read_only_fields = ["id", "parent", "created_at", "updated_at"]

    def to_internal_value(self, data):
        # Convert empty string dob to None
        if isinstance(data, dict):
            mutable_data = data.copy()
            if mutable_data.get('dob') == "":
                mutable_data['dob'] = None
            data = mutable_data
        elif hasattr(data, 'dict'):
            mutable_data = data.dict()
            if mutable_data.get('dob') == "":
                mutable_data['dob'] = None
            data = mutable_data
        return super().to_internal_value(data)

    def get_stories_read(self, obj):
        from .models import ReadingLog
        return ReadingLog.objects.filter(child=obj, completed=True).count() or ReadingLog.objects.filter(child=obj).count()

    def get_quiz_average(self, obj):
        from .models import QuizAttempt
        from django.db.models import Avg
        avg = QuizAttempt.objects.filter(child=obj).aggregate(avg=Avg('percentage'))['avg']
        return round(avg, 1) if avg is not None else 0

    def get_completion_percentage(self, obj):
        from .models import Story, ReadingLog
        from django.db.models import Q
        total_stories = Story.objects.filter(Q(child=obj) | Q(child_name__iexact=obj.name)).count()
        if not total_stories:
            total_stories = Story.objects.count()
        if not total_stories:
            return 0
        read_count = ReadingLog.objects.filter(child=obj).count()
        return min(100, round((read_count / total_stories) * 100))



class StoryPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryPage
        fields = [
            "id", "page_number", "text_en", "text_hi",
            "illustration_prompt", "dictionary",
        ]
        read_only_fields = ["id"]


class StorySerializer(serializers.ModelSerializer):
    pages = StoryPageSerializer(many=True, read_only=True)
    child_id = serializers.PrimaryKeyRelatedField(
        queryset=ChildProfile.objects.all(),
        source='child',
        required=False,
        allow_null=True
    )
    is_favourited = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            "id", "parent", "child", "child_id",
            "title_en", "title_hi",
            "child_name", "child_age", "child_gender",
            "builder_mode",
            "hero_animal", "hero_job", "hero_color",
            "setting", "companion", "story_mood",
            "magic_power", "story_ending",
            "moral", "vocab_theme", "language", "story_length",
            "encouraged_behavior", "sidekick", "magic_object",
            "art_style", "tone", "grade", "pronoun", "rival",
            "num_pages", "reading_difficulty",
            "cultural_elements", "bedtime_safe",
            "cover_image_url", "is_favourite",
            "created_at", "pages", "is_favourited",
        ]
        read_only_fields = ["id", "created_at", "pages", "parent"]

    def get_is_favourited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return FavouriteStory.objects.filter(
                parent=request.user, story=obj
            ).exists()
        return False


class ReadingLogSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')

    class Meta:
        model = ReadingLog
        fields = [
            "id", "child", "child_name",
            "story", "story_title", "read_date",
            "reading_time_minutes", "pages_read",
            "completed", "rating", "notes", "created_at",
        ]
        read_only_fields = ["id", "created_at", "child"]


class ReadingProgressSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')
    story_title = serializers.ReadOnlyField(source='story.title_en')

    class Meta:
        model = ReadingProgress
        fields = [
            "id", "child", "child_name",
            "story", "story_title",
            "last_opened_page", "completion_percentage",
            "completed", "total_reading_time_seconds",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]


class ReadingSessionSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')
    story_title = serializers.ReadOnlyField(source='story.title_en')

    class Meta:
        model = ReadingSession
        fields = [
            "id", "child", "child_name",
            "story", "story_title",
            "start_time", "end_time", "duration_minutes",
        ]
        read_only_fields = ["id"]


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = [
            "id", "question_text",
            "option_a", "option_b", "option_c", "option_d",
            "correct_option",
        ]
        read_only_fields = ["id"]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    story_title = serializers.ReadOnlyField(source='story.title_en')

    class Meta:
        model = Quiz
        fields = ["id", "story", "story_title", "title", "questions", "created_at"]
        read_only_fields = ["id", "created_at"]


class QuizAttemptSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')
    quiz_title = serializers.ReadOnlyField(source='quiz.title')
    story_title = serializers.ReadOnlyField(source='quiz.story.title_en')

    class Meta:
        model = QuizAttempt
        fields = [
            "id", "quiz", "quiz_title", "story_title",
            "child", "child_name",
            "score", "total_questions", "percentage",
            "attempted_at",
        ]
        read_only_fields = ["id", "attempted_at", "child"]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "code", "name", "emoji", "description", "required_count"]


class ChildAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = ChildAchievement
        fields = ["id", "child", "achievement", "earned_at"]


class ParentNoteSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')

    class Meta:
        model = ParentNote
        fields = [
            "id", "parent", "child", "child_name",
            "reading_log", "note", "created_at",
        ]
        read_only_fields = ["id", "parent", "created_at"]


class CertificateSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')

    class Meta:
        model = Certificate
        fields = [
            "id", "child", "child_name",
            "title", "description", "issued_date",
        ]
        read_only_fields = ["id"]


class FavouriteStorySerializer(serializers.ModelSerializer):
    story_title = serializers.ReadOnlyField(source='story.title_en')
    child_name = serializers.ReadOnlyField(source='child.name')

    class Meta:
        model = FavouriteStory
        fields = [
            "id", "parent", "child", "child_name",
            "story", "story_title", "created_at",
        ]
        read_only_fields = ["id", "parent", "created_at"]





class ClassAssignmentStudentSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')
    avatar = serializers.ReadOnlyField(source='child.avatar')

    class Meta:
        model = ClassAssignmentStudent
        fields = ["id", "assignment", "child", "child_name", "avatar", "status", "completion_percentage", "score", "completed_at"]
        read_only_fields = ["id"]


class ClassAssignmentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.ReadOnlyField(source='classroom.name')
    story_title = serializers.ReadOnlyField(source='story.title_en')
    assigned_count = serializers.SerializerMethodField()
    completed_count = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()

    class Meta:
        model = ClassAssignment
        fields = [
            "id", "teacher", "classroom", "classroom_name", "title",
            "assignment_type", "description", "instructions", "story",
            "story_title", "quiz", "lesson", "due_date", "status",
            "reading_level", "target_all_students", "assigned_count",
            "completed_count", "completion_rate", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "teacher", "created_at", "updated_at"]

    def get_assigned_count(self, obj):
        if obj.target_all_students:
            return obj.classroom.enrolled_students.count()
        return obj.target_students.count()

    def get_completed_count(self, obj):
        return obj.target_students.filter(status='completed').count()

    def get_completion_rate(self, obj):
        total = self.get_assigned_count(obj)
        if total == 0:
            return 0
        completed = self.get_completed_count(obj)
        return round((completed / total) * 100)



class LessonSubmissionSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')
    lesson_title = serializers.ReadOnlyField(source='lesson.title')

    class Meta:
        model = LessonSubmission
        fields = [
            "id", "lesson", "lesson_title", "child", "child_name",
            "status", "completion_percentage", "score",
            "reading_time_minutes", "completed_at", "updated_at"
        ]
        read_only_fields = ["id", "updated_at"]


class LessonSerializer(serializers.ModelSerializer):
    story_title = serializers.ReadOnlyField(source='story.title_en')
    students_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id", "teacher", "classroom", "story", "story_title",
            "title", "description", "grade", "status", "due_date",
            "due_date_timestamp", "total_students", "students_completed",
            "created_at"
        ]
        read_only_fields = ["id", "teacher", "created_at"]

    def get_students_completed(self, obj):
        return obj.submissions.filter(status='completed').count()





class StoryApprovalSerializer(serializers.ModelSerializer):
    story_title = serializers.ReadOnlyField(source='story.title_en')
    child_name = serializers.ReadOnlyField(source='story.child_name')

    class Meta:
        model = StoryApproval
        fields = [
            "id", "story", "story_title", "child_name", "parent",
            "status", "reviewer_notes", "reviewed_at", "created_at"
        ]
        read_only_fields = ["id", "parent", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id", "user", "notification_type", "title", "message",
            "is_read", "related_object_type", "related_object_id", "created_at"
        ]
        read_only_fields = ["id", "user", "created_at"]


class ChildGoalSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = ChildGoal
        fields = [
            "id", "parent", "child", "child_name", "goal_type", "title",
            "description", "target_value", "current_value", "deadline",
            "status", "progress_percentage", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "parent", "created_at", "updated_at"]


class ReadingStreakSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')

    class Meta:
        model = ReadingStreak
        fields = [
            "id", "child", "child_name", "current_streak",
            "longest_streak", "last_read_date", "total_stars", "updated_at"
        ]
        read_only_fields = ["id", "updated_at"]


class ReadingScheduleSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = ReadingSchedule
        fields = [
            "id", "parent", "child", "child_name", "day_of_week",
            "day_name", "time", "label", "is_active", "created_at"
        ]
        read_only_fields = ["id", "parent", "created_at"]


class StoryRatingSerializer(serializers.ModelSerializer):
    story_title = serializers.ReadOnlyField(source='story.title_en')
    parent_username = serializers.ReadOnlyField(source='parent.username')

    class Meta:
        model = StoryRating
        fields = [
            "id", "parent", "parent_username", "story", "story_title",
            "rating", "comment", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "parent", "created_at", "updated_at"]


class RewardShopItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardShopItem
        fields = [
            "id", "name", "category", "cost_stars", "emoji",
            "description", "is_active", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class RewardPurchaseSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')
    item_details = RewardShopItemSerializer(source='item', read_only=True)

    class Meta:
        model = RewardPurchase
        fields = [
            "id", "child", "child_name", "item", "item_details", "purchased_at"
        ]
        read_only_fields = ["id", "purchased_at"]


class CertificateSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')
    issuer_name = serializers.SerializerMethodField()
    classroom_name = serializers.ReadOnlyField(source='classroom.name')

    class Meta:
        model = Certificate
        fields = [
            "id", "certificate_number", "child", "child_name", "issuer",
            "issuer_name", "classroom", "classroom_name", "certificate_type",
            "title", "description", "issued_date", "status", "revoked_reason",
            "created_at"
        ]
        read_only_fields = ["id", "certificate_number", "created_at"]

    def get_issuer_name(self, obj):
        if obj.issuer:
            return f"{obj.issuer.first_name} {obj.issuer.last_name}".strip() or obj.issuer.username
        return "Lead Educator"


class StudentReportSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')
    teacher_name = serializers.SerializerMethodField()
    classroom_name = serializers.ReadOnlyField(source='classroom.name')
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    period_display = serializers.CharField(source='get_period_display', read_only=True)

    class Meta:
        model = StudentReport
        fields = [
            "id", "report_number", "child", "child_name", "teacher",
            "teacher_name", "classroom", "classroom_name", "report_type",
            "report_type_display", "period", "period_display", "data_snapshot",
            "teacher_notes", "created_at"
        ]
        read_only_fields = ["id", "report_number", "teacher", "created_at"]




class ClassAssignmentStudentSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='child.name')
    student_avatar = serializers.ReadOnlyField(source='child.avatar')
    student_grade = serializers.ReadOnlyField(source='child.grade_level')
    student_reading_level = serializers.ReadOnlyField(source='child.reading_level')

    class Meta:
        model = ClassAssignmentStudent
        fields = [
            "id", "assignment", "child", "student_name", "student_avatar",
            "student_grade", "student_reading_level", "status",
            "completion_percentage", "score", "feedback",
            "started_at", "submitted_at", "completed_at", "reviewed_at"
        ]
        read_only_fields = ["id", "assignment"]


class ClassAssignmentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.ReadOnlyField(source='classroom.name')
    story_details = serializers.SerializerMethodField()
    quiz_details = serializers.SerializerMethodField()
    target_students_list = ClassAssignmentStudentSerializer(source='target_students', many=True, read_only=True)
    
    # Aggregates
    total_assigned_students = serializers.SerializerMethodField()
    completed_students_count = serializers.SerializerMethodField()
    submitted_students_count = serializers.SerializerMethodField()
    needs_review_count = serializers.SerializerMethodField()
    overdue_students_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    avg_score = serializers.SerializerMethodField()

    class Meta:
        model = ClassAssignment
        fields = [
            "id", "teacher", "classroom", "classroom_name", "title",
            "assignment_type", "description", "instructions", "teacher_note",
            "story", "story_details", "quiz", "quiz_details", "lesson",
            "start_date", "due_date", "allow_late_submission", "status",
            "reading_level", "target_all_students", "created_at", "updated_at",
            "target_students_list", "total_assigned_students",
            "completed_students_count", "submitted_students_count",
            "needs_review_count", "overdue_students_count",
            "completion_percentage", "avg_score"
        ]
        read_only_fields = ["id", "teacher", "created_at", "updated_at"]

    def get_story_details(self, obj):
        if obj.story:
            return {
                'id': obj.story.id,
                'title': obj.story.title_en,
                'reading_difficulty': obj.story.reading_difficulty,
                'cover_image_url': obj.story.cover_image_url,
            }
        return None

    def get_quiz_details(self, obj):
        if obj.quiz:
            return {
                'id': obj.quiz.id,
                'title': obj.quiz.title,
                'total_questions': obj.quiz.questions.count() if hasattr(obj.quiz, 'questions') else 5,
            }
        return None

    def get_total_assigned_students(self, obj):
        return obj.target_students.count()

    def get_completed_students_count(self, obj):
        return obj.target_students.filter(status__in=['completed', 'reviewed']).count()

    def get_submitted_students_count(self, obj):
        return obj.target_students.filter(status='submitted').count()

    def get_needs_review_count(self, obj):
        return obj.target_students.filter(status='submitted').count()

    def get_overdue_students_count(self, obj):
        from django.utils import timezone
        if obj.due_date and obj.due_date < timezone.now().date():
            return obj.target_students.exclude(status__in=['completed', 'reviewed']).count()
        return 0

    def get_completion_percentage(self, obj):
        total = obj.target_students.count()
        if not total:
            return 0
        comp = obj.target_students.filter(status__in=['completed', 'reviewed']).count()
        return round((comp / total) * 100)

    def get_avg_score(self, obj):
        from django.db.models import Avg
        avg = obj.target_students.filter(score__isnull=False).aggregate(avg=Avg('score'))['avg']
        return round(avg, 1) if avg is not None else None


class TeacherEventSerializer(serializers.ModelSerializer):
    classroom_name = serializers.ReadOnlyField(source='classroom.name')
    lesson_title = serializers.ReadOnlyField(source='lesson.title')

    class Meta:
        model = TeacherEvent
        fields = [
            "id", "teacher", "event_type", "title", "description",
            "location", "date", "start_time", "end_time", "classroom",
            "classroom_name", "lesson", "lesson_title", "status",
            "is_recurring", "recurrence_rule", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "teacher", "created_at", "updated_at"]


class TeacherStoryLibrarySerializer(serializers.ModelSerializer):
    is_saved = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    assigned_count = serializers.SerializerMethodField()
    lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            "id", "child_name", "title_en", "title_hi", "moral",
            "vocab_theme", "language", "story_length", "encouraged_behavior",
            "grade", "num_pages", "reading_difficulty", "cover_image_url",
            "is_saved", "has_quiz", "assigned_count", "lessons_count", "created_at"
        ]

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return TeacherSavedStory.objects.filter(teacher=request.user, story=obj).exists()
        return False

    def get_has_quiz(self, obj):
        return Quiz.objects.filter(story=obj).exists()

    def get_assigned_count(self, obj):
        return ClassAssignment.objects.filter(story=obj).count()

    def get_lessons_count(self, obj):
        return Lesson.objects.filter(title__icontains=obj.title_en).count()






