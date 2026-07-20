from rest_framework import serializers
from .models import User, Story, StoryPage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone']

class StoryPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoryPage
        fields = ['id', 'page_number', 'text_en', 'text_es', 'illustration_prompt', 'dictionary']

class StorySerializer(serializers.ModelSerializer):
    pages = StoryPageSerializer(many=True, read_only=True)

    class Meta:
        model = Story
        fields = [
            'id', 'title_en', 'title_es', 'child_name', 'child_age', 'child_gender', 'builder_mode',
            'hero_animal', 'hero_job', 'hero_color', 'setting', 'companion', 'story_mood', 'magic_power', 'story_ending',
            'moral', 'vocab_theme', 'language', 'story_length', 'encouraged_behavior', 'sidekick', 'magic_object',
            'art_style', 'tone', 'grade', 'pronoun', 'rival', 'num_pages', 'reading_difficulty', 'cultural_elements',
            'bedtime_safe', 'created_at', 'pages'
        ]
