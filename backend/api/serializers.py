from rest_framework import serializers

from .models import Story, StoryPage, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "phone",
        ]
        read_only_fields = ["id"]


class StoryPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryPage
        fields = [
            "id",
            "page_number",
            "text_en",
            "text_hi",
            "illustration_prompt",
            "illustration_url",
            "dictionary",
        ]
        read_only_fields = ["id"]


class StorySerializer(serializers.ModelSerializer):
    pages = StoryPageSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Story
        fields = [
            "id",
            "title_en",
            "title_hi",
            "child_name",
            "child_age",
            "child_gender",
            "builder_mode",

            # Child information
            "family_details",
            "favorite_things",
            "special_interests",

            # Kids Mode
            "hero_animal",
            "hero_job",
            "hero_color",
            "setting",
            "companion",
            "story_mood",
            "magic_power",
            "story_ending",

            # Parent / Teacher Mode
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

            # Generation metadata
            "generated_by",
            "created_at",
            "updated_at",

            # Related pages
            "pages",
        ]

        read_only_fields = [
            "id",
            "generated_by",
            "created_at",
            "updated_at",
            "pages",
        ]