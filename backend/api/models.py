from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        PARENT = 'PARENT', 'Parent'
        CHILD = 'CHILD', 'Child'

    role = models.CharField(
        max_length=15,
        choices=Role.choices,
        default=Role.CHILD
    )

    # Basic helper fields
    phone = models.CharField(max_length=15, blank=True, null=True)
    
    def __str__(self):
        return f"{self.username} ({self.role})"


class Story(models.Model):
    title_en = models.CharField(max_length=255, default="A New Adventure")
    title_hi = models.CharField(max_length=255, default="एक नया रोमांच")
    child_name = models.CharField(max_length=100)
    child_age = models.IntegerField(null=True, blank=True)
    child_gender = models.CharField(max_length=50, default='boy')
    builder_mode = models.CharField(max_length=20, default='child')
    
    # Kids Mode fields
    hero_animal = models.CharField(max_length=100, blank=True, null=True)
    hero_job = models.CharField(max_length=100, blank=True, null=True)
    hero_color = models.CharField(max_length=100, blank=True, null=True)
    setting = models.CharField(max_length=100, blank=True, null=True)
    companion = models.CharField(max_length=100, blank=True, null=True)
    story_mood = models.CharField(max_length=100, blank=True, null=True)
    magic_power = models.CharField(max_length=100, blank=True, null=True)
    story_ending = models.CharField(max_length=100, blank=True, null=True)
    
    # Parent/Teacher Mode fields
    moral = models.CharField(max_length=100, blank=True, null=True)
    vocab_theme = models.CharField(max_length=100, blank=True, null=True)
    language = models.CharField(max_length=50, default='bilingual')
    story_length = models.CharField(max_length=50, default='medium')
    encouraged_behavior = models.CharField(max_length=255, blank=True, null=True)
    sidekick = models.CharField(max_length=100, blank=True, null=True)
    magic_object = models.CharField(max_length=100, blank=True, null=True)
    art_style = models.CharField(max_length=100, default='watercolor')
    tone = models.CharField(max_length=100, default='whimsical')
    grade = models.CharField(max_length=50, default='grade-2')
    pronoun = models.CharField(max_length=20, default='he')
    rival = models.CharField(max_length=100, blank=True, null=True)
    num_pages = models.IntegerField(default=5)
    reading_difficulty = models.CharField(max_length=50, default='medium')
    cultural_elements = models.CharField(max_length=100, default='mixed')
    bedtime_safe = models.CharField(max_length=20, default='yes')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Story for {self.child_name} - Mode: {self.builder_mode} ({self.created_at.strftime('%Y-%m-%d')})"


class StoryPage(models.Model):
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='pages')
    page_number = models.IntegerField()
    text_en = models.TextField()
    text_hi = models.TextField(blank=True, null=True)
    illustration_prompt = models.TextField(blank=True, null=True)
    dictionary = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['page_number']

    def __str__(self):
        return f"Page {self.page_number} of Story ID {self.story.id}"
