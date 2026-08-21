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
    bio = models.TextField(blank=True, default='')
    avatar = models.CharField(max_length=255, blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    address = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='')
    postal_code = models.CharField(max_length=20, blank=True, default='')
    settings = models.JSONField(default=dict, blank=True)
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
        related_name='children',
        null=True,
        blank=True
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
    read_date = models.DateField(default=timezone.localdate)
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
    CERT_TYPE_CHOICES = [
        ('reading_excellence', 'Reading Excellence'),
        ('story_explorer', 'Story Explorer'),
        ('quiz_champion', 'Quiz Champion'),
        ('reading_streak', 'Reading Streak Milestone'),
        ('learning_achievement', 'Learning Achievement'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('revoked', 'Revoked'),
    ]

    certificate_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='certificates')
    issuer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='issued_certificates')
    classroom = models.ForeignKey('TeacherClass', on_delete=models.SET_NULL, null=True, blank=True, related_name='certificates')
    certificate_type = models.CharField(max_length=50, choices=CERT_TYPE_CHOICES, default='reading_excellence')
    title = models.CharField(max_length=255, default="Super Reader Certificate")
    description = models.TextField()
    issued_date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    revoked_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-issued_date', '-created_at']

    def __str__(self):
        return f"Certificate {self.certificate_number or self.id}: {self.title} for {self.child.name}"


class StudentReport(models.Model):
    REPORT_TYPE_CHOICES = [
        ('progress_report', 'Student Progress Report'),
        ('reading_report', 'Reading Activity Report'),
        ('quiz_report', 'Quiz Assessment Report'),
        ('assignment_report', 'Assignment Performance Report'),
    ]
    PERIOD_CHOICES = [
        ('last_7_days', 'Last 7 Days'),
        ('last_30_days', 'Last 30 Days'),
        ('last_3_months', 'Last 3 Months'),
        ('academic_year', 'Academic Year'),
    ]

    report_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='academic_reports')
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_reports')
    classroom = models.ForeignKey('TeacherClass', on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    report_type = models.CharField(max_length=50, choices=REPORT_TYPE_CHOICES, default='progress_report')
    period = models.CharField(max_length=30, choices=PERIOD_CHOICES, default='last_30_days')
    data_snapshot = models.JSONField(default=dict, blank=True)
    teacher_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report {self.report_number or self.id}: {self.get_report_type_display()} for {self.child.name}"



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
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]

    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='classes'
    )
    name = models.CharField(max_length=100, default='Grade 3 — Section A')
    grade_level = models.CharField(max_length=50, default='Grade 3')
    section = models.CharField(max_length=20, default='A')
    school_name = models.CharField(max_length=255, default='Oakridge Elementary')
    description = models.TextField(blank=True, default='')
    subject = models.CharField(max_length=100, default='Reading & Literature')
    academic_year = models.CharField(max_length=20, default='2026-2027')
    max_students = models.IntegerField(default=30)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    join_code = models.CharField(max_length=20, blank=True, null=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.grade_level} ({self.teacher.username})"


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


class ClassAssignment(models.Model):
    ASSIGNMENT_TYPE_CHOICES = [
        ('story', 'Story Reading'),
        ('quiz', 'Quiz Assessment'),
        ('reading_task', 'Reading Task'),
        ('lesson', 'Lesson'),
        ('activity', 'Learning Activity'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]

    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_assignments')
    classroom = models.ForeignKey(TeacherClass, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    assignment_type = models.CharField(max_length=30, choices=ASSIGNMENT_TYPE_CHOICES, default='story')
    description = models.TextField(blank=True, default='')
    instructions = models.TextField(blank=True, default='')
    teacher_note = models.TextField(blank=True, default='')
    story = models.ForeignKey(Story, on_delete=models.SET_NULL, null=True, blank=True, related_name='class_assignments')
    quiz = models.ForeignKey(Quiz, on_delete=models.SET_NULL, null=True, blank=True, related_name='class_assignments')
    lesson = models.ForeignKey('Lesson', on_delete=models.SET_NULL, null=True, blank=True, related_name='class_assignments')
    start_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    allow_late_submission = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    reading_level = models.CharField(max_length=50, default='All Levels')
    target_all_students = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.classroom.name})"


class ClassAssignmentStudent(models.Model):
    STUDENT_STATUS_CHOICES = [
        ('assigned', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('late', 'Late'),
        ('missing', 'Missing'),
    ]

    assignment = models.ForeignKey(ClassAssignment, on_delete=models.CASCADE, related_name='target_students')
    child = models.ForeignKey(ChildProfile, on_delete=models.CASCADE, related_name='assigned_tasks')
    status = models.CharField(max_length=20, choices=STUDENT_STATUS_CHOICES, default='assigned')
    completion_percentage = models.IntegerField(default=0)
    score = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True, default='')
    started_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('assignment', 'child')

    def __str__(self):
        return f"{self.child.name} - {self.assignment.title} ({self.status})"



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


class StoryApproval(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    story = models.OneToOneField(
        Story,
        on_delete=models.CASCADE,
        related_name='approval'
    )
    parent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='story_approvals'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewer_notes = models.TextField(blank=True, default='')
    reviewed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Approval: {self.story.title_en} ({self.status})"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('story_completed', 'Story Completed'),
        ('new_badge', 'New Badge'),
        ('certificate_earned', 'Certificate Earned'),
        ('teacher_story', 'Teacher Uploaded Story'),
        ('goal_completed', 'Goal Completed'),
        ('quiz_finished', 'Quiz Finished'),
        ('streak_milestone', 'Streak Milestone'),
        ('approval_needed', 'Approval Needed'),
        ('system', 'System'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='system')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_object_type = models.CharField(max_length=50, blank=True, default='')
    related_object_id = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification: {self.title} ({self.notification_type})"


class ChildGoal(models.Model):
    GOAL_TYPE_CHOICES = [
        ('stories_per_week', 'Stories Per Week'),
        ('minutes_per_day', 'Minutes Per Day'),
        ('quiz_score', 'Quiz Score Above'),
        ('quizzes_per_week', 'Quizzes Per Week'),
        ('streak_days', 'Reading Streak Days'),
        ('custom', 'Custom Goal'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
        ('paused', 'Paused'),
    ]

    parent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='child_goals'
    )
    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.CASCADE,
        related_name='goals'
    )
    goal_type = models.CharField(max_length=30, choices=GOAL_TYPE_CHOICES, default='stories_per_week')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    target_value = models.IntegerField(default=5)
    current_value = models.IntegerField(default=0)
    deadline = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Goal: {self.title} for {self.child.name}"

    @property
    def progress_percentage(self):
        if self.target_value <= 0:
            return 0
        return min(100, round((self.current_value / self.target_value) * 100))


class ReadingStreak(models.Model):
    child = models.OneToOneField(
        ChildProfile,
        on_delete=models.CASCADE,
        related_name='streak'
    )
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_read_date = models.DateField(blank=True, null=True)
    total_stars = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Streak: {self.child.name} ({self.current_streak} days)"


class ReadingSchedule(models.Model):
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    parent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reading_schedules'
    )
    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.CASCADE,
        related_name='reading_schedules'
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    time = models.TimeField()
    label = models.CharField(max_length=100, blank=True, default='Reading Time')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['day_of_week', 'time']

    def __str__(self):
        return f"Schedule: {self.child.name} - {self.get_day_of_week_display()} {self.time}"


class StoryRating(models.Model):
    parent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='story_ratings'
    )
    story = models.ForeignKey(
        Story,
        on_delete=models.CASCADE,
        related_name='ratings'
    )
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('parent', 'story')
        ordering = ['-created_at']

    def __str__(self):
        return f"Rating: {self.story.title_en} - {self.rating}/5 by {self.parent.username}"


class RewardShopItem(models.Model):
    CATEGORY_CHOICES = [
        ('theme', 'Theme'),
        ('avatar', 'Avatar'),
        ('story_pack', 'Story Pack'),
        ('badge', 'Badge'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='badge')
    cost_stars = models.IntegerField(default=10)
    emoji = models.CharField(max_length=20, default='🎁')
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'cost_stars']

    def __str__(self):
        return f"{self.emoji} {self.name} ({self.cost_stars}⭐)"


class RewardPurchase(models.Model):
    child = models.ForeignKey(
        ChildProfile,
        on_delete=models.CASCADE,
        related_name='reward_purchases'
    )
    item = models.ForeignKey(
        RewardShopItem,
        on_delete=models.CASCADE,
        related_name='purchases'
    )
    purchased_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('child', 'item')
        ordering = ['-purchased_at']

    def __str__(self):
        return f"{self.child.name} bought {self.item.name}"


class PasswordResetOTP(models.Model):
    """Stores a 6-digit OTP for password reset requests."""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_otps'
    )
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.user.username} - {'Used' if self.is_used else 'Active'}"

    def is_valid(self):
        """Check if OTP is still valid (not used and within 10 minutes)."""
        if self.is_used:
            return False
        expiry_time = self.created_at + timezone.timedelta(minutes=10)
        return timezone.now() <= expiry_time

    @classmethod
    def generate_otp(cls, user):
        """Generate a new 6-digit OTP for the given user, invalidating old ones."""
        import random
        # Invalidate all previous OTPs for this user
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        # Generate new 6-digit OTP
        otp_code = f"{random.randint(100000, 999999)}"
        otp_instance = cls.objects.create(user=user, otp=otp_code)
        return otp_instance


class UserActivityLog(models.Model):
    """Logs user authentication and activity events (LOGIN, SIGNUP, PASSWORD_RESET, etc.)."""
    ACTION_CHOICES = [
        ('LOGIN', 'User Logged In'),
        ('SIGNUP', 'New User Registered'),
        ('PASSWORD_RESET_REQUEST', 'Password Reset Requested'),
        ('PASSWORD_RESET_SUCCESS', 'Password Reset Successful'),
        ('LOGOUT', 'User Logged Out'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    ip_address = models.CharField(max_length=45, blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    details = models.CharField(max_length=255, blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"


class TeacherEvent(models.Model):
    EVENT_TYPE_CHOICES = [
        ('class', 'Classroom Session'),
        ('lesson', 'Lesson Activity'),
        ('meeting', 'Meeting'),
        ('office_hours', 'Office Hours'),
        ('other', 'Other Teaching Event'),
    ]
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scheduled_events')
    event_type = models.CharField(max_length=30, choices=EVENT_TYPE_CHOICES, default='class')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    location = models.CharField(max_length=255, blank=True, default='Room 204')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    classroom = models.ForeignKey(TeacherClass, on_delete=models.SET_NULL, null=True, blank=True, related_name='scheduled_events')
    lesson = models.ForeignKey('Lesson', on_delete=models.SET_NULL, null=True, blank=True, related_name='scheduled_events')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    is_recurring = models.BooleanField(default=False)
    recurrence_rule = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.title} - {self.date} ({self.start_time} - {self.end_time})"


class TeacherSavedStory(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_stories')
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='saved_by_teachers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('teacher', 'story')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.teacher.username} saved {self.story.title_en}"




