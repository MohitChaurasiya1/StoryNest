from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        PARENT = 'PARENT', 'Parent'
        CHILD = 'CHILD', 'Child'

    role = models.CharField(
        max_length=15,
        choices=Role.choices,
        default=Role.PARENT
    )

    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class ChildProfile(models.Model):
    GENDER_CHOICES = [
        ('boy', 'Boy'),
        ('girl', 'Girl'),
        ('other', 'Other'),
    ]

    parent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='children'
    )
    name = models.CharField(max_length=100)
    age = models.IntegerField(default=7)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='boy')
    grade_level = models.CharField(max_length=50, default='Grade 2')
    preferred_language = models.CharField(max_length=50, default='Bilingual (EN/HI)')
    avatar = models.CharField(max_length=50, default='🦁')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (Parent: {self.parent.username})"


class Story(models.Model):
    parent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stories'
    )
    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stories'
    )
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


class ReadingLog(models.Model):
    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.CASCADE,
        related_name='reading_logs'
    )
    story = models.ForeignKey(
        Story,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reading_logs'
    )
    story_title = models.CharField(max_length=255, blank=True)
    read_date = models.DateField(default=timezone.now)
    reading_time_minutes = models.IntegerField(default=15)
    pages_read = models.IntegerField(default=5)
    completed = models.BooleanField(default=True)
    rating = models.IntegerField(default=5)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-read_date', '-created_at']

    def save(self, *args, **kwargs):
        if self.story and not self.story_title:
            self.story_title = self.story.title_en
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.child.name} read '{self.story_title}' on {self.read_date} ({self.reading_time_minutes}m)"


class Achievement(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    emoji = models.CharField(max_length=20, default='🏆')
    description = models.TextField()
    required_count = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.emoji} {self.name} ({self.code})"


class ChildAchievement(models.Model):
    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.CASCADE,
        related_name='achievements'
    )
    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE,
        related_name='child_achievements'
    )
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('child', 'achievement')
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.child.name} earned {self.achievement.name}"
