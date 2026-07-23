from rest_framework import serializers
from .models import User, ChildProfile, Story, StoryPage, ReadingLog, Achievement, ChildAchievement


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
        return user


class ChildProfileSerializer(serializers.ModelSerializer):
    parent = serializers.ReadOnlyField(source='parent.username')

    class Meta:
        model = ChildProfile
        fields = [
            "id",
            "parent",
            "name",
            "age",
            "gender",
            "grade_level",
            "preferred_language",
            "avatar",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "parent", "created_at", "updated_at"]


class StoryPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryPage
        fields = [
            "id",
            "page_number",
            "text_en",
            "text_hi",
            "illustration_prompt",
            "dictionary",
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

    class Meta:
        model = Story
        fields = [
            "id",
            "parent",
            "child",
            "child_id",
            "title_en",
            "title_hi",
            "child_name",
            "child_age",
            "child_gender",
            "builder_mode",
            "hero_animal",
            "hero_job",
            "hero_color",
            "setting",
            "companion",
            "story_mood",
            "magic_power",
            "story_ending",
            "moral",
            "vocab_theme",
            "language",
            "story_length",
            "encouraged_behavior",
            "sidekick",
            "magic_object",
            "art_style",
            "tone",
            "grade",
            "pronoun",
            "rival",
            "num_pages",
            "reading_difficulty",
            "cultural_elements",
            "bedtime_safe",
            "created_at",
            "pages",
        ]
        read_only_fields = ["id", "created_at", "pages", "parent"]


class ReadingLogSerializer(serializers.ModelSerializer):
    child_name = serializers.ReadOnlyField(source='child.name')

    class Meta:
        model = ReadingLog
        fields = [
            "id",
            "child",
            "child_name",
            "story",
            "story_title",
            "read_date",
            "reading_time_minutes",
            "pages_read",
            "completed",
            "rating",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "code", "name", "emoji", "description", "required_count"]


class ChildAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = ChildAchievement
        fields = ["id", "child", "achievement", "earned_at"]