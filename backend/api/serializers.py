from rest_framework import serializers
from .models import (
    User, ParentProfile, ChildProfile, Story, StoryPage,
    ReadingLog, ReadingProgress, ReadingSession,
    Quiz, QuizQuestion, QuizAttempt,
    Achievement, ChildAchievement,
    ParentNote, Certificate, FavouriteStory
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "phone"]
        read_only_fields = ["id"]


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role", "phone"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.PARENT),
            phone=validated_data.get('phone', '')
        )
        # Auto-create ParentProfile for PARENT users
        if user.role == User.Role.PARENT:
            ParentProfile.objects.get_or_create(user=user)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)


class ParentProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    phone = serializers.ReadOnlyField(source='user.phone')

    class Meta:
        model = ParentProfile
        fields = [
            "id", "username", "email", "phone",
            "preferred_language", "theme_preference",
            "email_notifications", "weekly_reports",
            "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class ChildProfileSerializer(serializers.ModelSerializer):
    parent = serializers.ReadOnlyField(source='parent.username')

    class Meta:
        model = ChildProfile
        fields = [
            "id", "parent", "name", "age", "dob", "gender",
            "grade_level", "preferred_language",
            "interests", "favourite_colour", "favourite_animal",
            "reading_level", "learning_goals",
            "avatar", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "parent", "created_at", "updated_at"]


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
