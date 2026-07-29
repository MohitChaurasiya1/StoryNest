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


class ParentProfile(models.Model):
    THEME_CHOICES = [
        ('light', 'Light Mode'),
        ('dark', 'Dark Mode'),
        ('system', 'System Default'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='parent_profile'
    )
    preferred_language = models.CharField(max_length=50, default='Bilingual (EN/HI)')
    theme_preference = models.CharField(max_length=20, choices=THEME_CHOICES, default='light')
    email_notifications = models.BooleanField(default=True)
    weekly_reports = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ParentProfile for {self.user.username}"


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
    dob = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='boy')
    grade_level = models.CharField(max_length=50, default='Grade 2')
    preferred_language = models.CharField(max_length=50, default='Bilingual (EN/HI)')
    interests = models.CharField(max_length=255, blank=True, default='Animals, Space, Magic')
    favourite_colour = models.CharField(max_length=50, blank=True, default='Blue')
    favourite_animal = models.CharField(max_length=50, blank=True, default='Lion')
    reading_level = models.CharField(max_length=50, default='Beginner')
    learning_goals = models.TextField(blank=True, default='Improve Hindi vocabulary and reading consistency')
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

    hero_animal = models.CharField(max_length=100, blank=True, null=True)
    hero_job = models.CharField(max_length=100, blank=True, null=True)
    hero_color = models.CharField(max_length=100, blank=True, null=True)
    setting = models.CharField(max_length=100, blank=True, null=True)
    companion = models.CharField(max_length=100, blank=True, null=True)
    story_mood = models.CharField(max_length=100, blank=True, null=True)
    magic_power = models.CharField(max_length=100, blank=True, null=True)
    story_ending = models.CharField(max_length=100, blank=True, null=True)

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

    cover_image_url = models.URLField(blank=True, null=True)
    is_favourite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Story for {self.child_name} ({self.title_en})"


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
        return f"{self.child.name} read '{self.story_title}'"


class ReadingProgress(models.Model):
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='progress_records')
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='progress_records')
    last_opened_page = models.IntegerField(default=1)
    completion_percentage = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    total_reading_time_seconds = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('child', 'story')

    def __str__(self):
        return f"{self.child.name} - {self.story.title_en} ({self.completion_percentage}%)"


class ReadingSession(models.Model):
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='reading_sessions')
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='reading_sessions')
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(blank=True, null=True)
    duration_minutes = models.IntegerField(default=0)

    class Meta:
        ordering = ['-start_time']

    def __str__(self):
        return f"Session {self.child.name} - {self.story.title_en} ({self.duration_minutes}m)"


class Quiz(models.Model):
    story = models.OneToOneField(Story, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=255, default="Comprehension Check")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quiz for {self.story.title_en}"


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1, choices=[('A','A'),('B','B'),('C','C'),('D','D')])

    def __str__(self):
        return f"Q: {self.question_text[:30]}..."


class QuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='quiz_attempts')
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    percentage = models.FloatField(default=0.0)
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-attempted_at']

    def __str__(self):
        return f"{self.child.name} Quiz Score: {self.score}/{self.total_questions}"


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


class ParentNote(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parent_notes')
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='notes')
    reading_log = models.ForeignKey(ReadingLog, on_delete=models.CASCADE, null=True, blank=True, related_name='parent_notes')
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note for {self.child.name} by {self.parent.username}"


class Certificate(models.Model):
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='certificates')
    title = models.CharField(max_length=255, default="Super Reader Certificate")
    description = models.TextField()
    issued_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"Certificate: {self.title} for {self.child.name}"


class FavouriteStory(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favourite_stories')
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='favourite_stories')
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='favourited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('child', 'story')

    def __str__(self):
        return f"{self.child.name} favorited {self.story.title_en}"


class TeacherProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='teacher_profile'
    )
    school_name = models.CharField(max_length=255, default='Oakridge Elementary')
    grade_level = models.CharField(max_length=50, default='Grade 2 & 3')
    subject = models.CharField(max_length=100, default='Reading & Hindi Literature')
    bio = models.TextField(blank=True, default='Passionate primary grade teacher specializing in story-based language learning.')
    avatar = models.CharField(max_length=10, default='MR')
    email_notifications = models.BooleanField(default=True)
    theme_preference = models.CharField(max_length=20, default='light')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TeacherProfile for {self.user.username}"


class TeacherClass(models.Model):
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='classes'
    )
    name = models.CharField(max_length=100, default='Grade 2 - Owls')
    grade_level = models.CharField(max_length=50, default='Grade 2')
    academic_year = models.CharField(max_length=20, default='2025-2026')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.teacher.username})"


class ClassStudent(models.Model):
    classroom = models.ForeignKey(
        TeacherClass,
        on_delete=models.CASCADE,
        related_name='enrolled_students'
    )
    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.CASCADE,
        related_name='class_enrollments'
    )
    status = models.CharField(max_length=50, default='active')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('classroom', 'child')

    def __str__(self):
        return f"{self.child.name} in {self.classroom.name}"


class Lesson(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('upcoming', 'Upcoming'),
        ('completed', 'Completed'),
    ]

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_lessons'
    )
    classroom = models.ForeignKey(
        TeacherClass,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='lessons'
    )
    story = models.ForeignKey(
        Story,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_lessons'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    grade = models.CharField(max_length=50, default='Grade 2')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    due_date = models.CharField(max_length=100, default='Due Tomorrow')
    due_date_timestamp = models.DateTimeField(blank=True, null=True)
    total_students = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.status})"


class LessonSubmission(models.Model):
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.CASCADE,
        related_name='lesson_submissions'
    )
    status = models.CharField(max_length=20, default='assigned')
    completion_percentage = models.IntegerField(default=0)
    score = models.IntegerField(default=0)
    reading_time_minutes = models.IntegerField(default=0)
    completed_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('lesson', 'child')

    def __str__(self):
        return f"{self.child.name} - {self.lesson.title} ({self.status})"


class TeacherMessage(models.Model):
    MESSAGE_TYPE_CHOICES = [
        ('parent', 'Parent'),
        ('student', 'Student'),
        ('admin', 'Admin'),
        ('system', 'System'),
    ]

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_teacher_messages',
        null=True,
        blank=True
    )
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_teacher_messages',
        null=True,
        blank=True
    )
    sender_name = models.CharField(max_length=100, default='System Alert')
    recipient_name = models.CharField(max_length=100, default='Ms. Rivera')
    subject = models.CharField(max_length=255)
    content = models.TextField()
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='parent')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Msg: '{self.subject}' from {self.sender_name}"

