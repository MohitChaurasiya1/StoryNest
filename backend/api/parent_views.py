import datetime
from datetime import timedelta
from django.db import models
from django.utils import timezone
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User, ChildProfile, Story, ReadingLog, Achievement, ChildAchievement
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    ChildProfileSerializer,
    ReadingLogSerializer,
    StorySerializer,
    AchievementSerializer,
    ChildAchievementSerializer,
)


def evaluate_child_achievements(child):
    """
    Dynamically evaluates and unlocks achievements for a child based on real database records.
    """
    all_achievements = Achievement.objects.all()

    # Metrics
    logs = ReadingLog.objects.filter(child=child)
    completed_logs_count = logs.filter(completed=True).count()
    stories_count = Story.objects.filter(models.Q(child=child) | models.Q(child_name__iexact=child.name)).count()
    
    # Check bilingual reads
    has_bilingual = logs.filter(
        models.Q(story__language__icontains='bilingual') | 
        models.Q(story__language__icontains='hi') |
        models.Q(story__language__icontains='hindi')
    ).exists() or Story.objects.filter(child=child, language__icontains='bilingual').exists()

    # Distinct themes
    distinct_themes = Story.objects.filter(
        models.Q(child=child) | models.Q(child_name__iexact=child.name)
    ).exclude(vocab_theme__isnull=True).values('vocab_theme').distinct().count()

    # Bedtime safe / evening reads
    bedtime_count = logs.filter(story__bedtime_safe='yes').count()

    # Streak evaluation
    streak = calculate_streak_for_child(child)

    for ach in all_achievements:
        should_earn = False

        if ach.code == "BOOKWORM" and completed_logs_count >= ach.required_count:
            should_earn = True
        elif ach.code == "EXPLORER" and distinct_themes >= ach.required_count:
            should_earn = True
        elif ach.code == "BILINGUAL" and has_bilingual:
            should_earn = True
        elif ach.code == "NIGHT_OWL" and (bedtime_count >= ach.required_count or logs.count() >= ach.required_count):
            should_earn = True
        elif ach.code == "STORYTELLER" and (stories_count >= ach.required_count or logs.count() >= 1):
            should_earn = True
        elif ach.code == "CHAMPION" and streak >= ach.required_count:
            should_earn = True

        if should_earn:
            ChildAchievement.objects.get_or_create(child=child, achievement=ach)


def calculate_streak_for_child(child):
    """
    Calculates consecutive days of reading activity up to today/yesterday.
    """
    read_dates = list(
        ReadingLog.objects.filter(child=child)
        .values_list('read_date', flat=True)
        .distinct()
        .order_by('-read_date')
    )

    if not read_dates:
        return 0

    today = timezone.now().date()
    yesterday = today - timedelta(days=1)

    # Check if child read today or yesterday to maintain active streak
    if read_dates[0] != today and read_dates[0] != yesterday:
        return 0

    streak = 0
    current_check = read_dates[0]

    for r_date in read_dates:
        if r_date == current_check:
            streak += 1
            current_check = current_check - timedelta(days=1)
        elif r_date < current_check:
            # Broken streak
            break

    return streak


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = UserSerializer(request.user).data
        children = ChildProfile.objects.filter(parent=request.user)
        children_data = ChildProfileSerializer(children, many=True).data
        return Response({
            "user": user_data,
            "children": children_data
        })


class ChildProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ChildProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChildProfile.objects.filter(parent=self.request.user)

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


class ChildDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            child = ChildProfile.objects.get(id=id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response(
                {"error": "Child profile not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Evaluate badges dynamically
        evaluate_child_achievements(child)

        # 1. Streak
        streak = calculate_streak_for_child(child)

        # 2. Total Stories & Total Minutes
        logs = ReadingLog.objects.filter(child=child)
        total_books_read = logs.filter(completed=True).count()
        total_minutes = logs.aggregate(total=models.Sum('reading_time_minutes'))['total'] or 0

        # 3. Weekly Reading Activity (Current Mon -> Sun)
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday()) # Monday
        week_days = []
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        for i in range(7):
            day_date = start_of_week + timedelta(days=i)
            day_logs = logs.filter(read_date=day_date)
            day_mins = day_logs.aggregate(total=models.Sum('reading_time_minutes'))['total'] or 0
            has_read = day_mins > 0

            week_days.append({
                'day': day_names[i],
                'date': str(day_date),
                'read': has_read,
                'mins': day_mins
            })

        # 4. Recent Reads
        recent_logs = logs.select_related('story').order_by('-read_date', '-created_at')[:5]
        recent_stories = []
        for log in recent_logs:
            lang = "EN"
            if log.story:
                lang_val = (log.story.language or "bilingual").lower()
                if "bi" in lang_val:
                    lang = "EN/HI"
                elif "hi" in lang_val:
                    lang = "HI"
            progress = 100 if log.completed else min(100, int((log.pages_read / max(1, log.story.num_pages if log.story else 5)) * 100))

            date_str = "Today" if log.read_date == today else ("Yesterday" if log.read_date == (today - timedelta(days=1)) else log.read_date.strftime("%b %d"))

            recent_stories.append({
                "id": log.id,
                "story_id": log.story.id if log.story else None,
                "title": log.story_title or (log.story.title_en if log.story else "Story Read"),
                "lang": lang,
                "date": date_str,
                "progress": progress
            })

        # 5. Badges Summary
        total_badges = Achievement.objects.count()
        earned_badges = ChildAchievement.objects.filter(child=child).count()

        # 6. Dynamic Prompts / Ideas
        story_ideas = [
            {
                "prompt": f"A magical adventure where {child.name} finds a talking map of animal kingdoms",
                "theme": "Adventure",
                "difficulty": child.grade_level or "Grade 2"
            },
            {
                "prompt": f"How {child.name} helped a shy baby elephant learn how to paint rainbows",
                "theme": "Kindness",
                "difficulty": child.grade_level or "Grade 2"
            },
            {
                "prompt": f"A bedtime tale about glowing stars that play musical melodies in the garden",
                "theme": "Whimsical",
                "difficulty": "Bedtime Story"
            }
        ]

        return Response({
            "child": ChildProfileSerializer(child).data,
            "current_streak": streak,
            "total_books_read": total_books_read,
            "total_minutes": total_minutes,
            "weekly_activity": week_days,
            "recent_stories": recent_stories,
            "badges_summary": {
                "earned": earned_badges,
                "total": total_badges
            },
            "story_ideas": story_ideas
        })


class ChildInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            child = ChildProfile.objects.get(id=id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response(
                {"error": "Child profile not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        logs = ReadingLog.objects.filter(child=child)
        stories = Story.objects.filter(models.Q(child=child) | models.Q(child_name__iexact=child.name))

        # Language distribution
        bilingual_count = stories.filter(language__icontains='bilingual').count()
        english_count = stories.filter(language__icontains='en').count()
        hindi_count = stories.filter(language__icontains='hi').exclude(language__icontains='bilingual').count()

        # Popular themes / morals
        themes = stories.exclude(vocab_theme__isnull=True).values('vocab_theme').annotate(count=models.Count('id')).order_by('-count')[:5]

        # Monthly total reading mins
        total_mins = logs.aggregate(total=models.Sum('reading_time_minutes'))['total'] or 0

        # Recommendations
        recommendations = [
            f"Encourage {child.name} to read 15 minutes before bedtime for optimal retention.",
            f"Explore more bilingual (Hindi/English) stories to boost vocabulary comprehension.",
            f"Try co-creating stories with new character morals like Empathy and Curiosity."
        ]

        return Response({
            "child_id": child.id,
            "child_name": child.name,
            "total_reading_time_mins": total_mins,
            "stories_created_count": stories.count(),
            "reading_logs_count": logs.count(),
            "language_distribution": {
                "Bilingual": bilingual_count,
                "English": english_count,
                "Hindi": hindi_count
            },
            "top_vocab_themes": list(themes),
            "recommendations": recommendations
        })


class ReadingLogViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        child_id = self.kwargs.get('child_id')
        return ReadingLog.objects.filter(child__id=child_id, child__parent=self.request.user)

    def create(self, request, child_id=None):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response(
                {"error": "Child profile not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            log = serializer.save(child=child)
            # Re-evaluate achievements on new log creation
            evaluate_child_achievements(child)
            return Response(ReadingLogSerializer(log).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChildStoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            child = ChildProfile.objects.get(id=id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response(
                {"error": "Child profile not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        stories = Story.objects.filter(
            models.Q(child=child) | 
            models.Q(parent=request.user) | 
            models.Q(child_name__iexact=child.name)
        ).prefetch_related('pages').order_by('-created_at')

        return Response(StorySerializer(stories, many=True).data)


class ChildAchievementsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            child = ChildProfile.objects.get(id=id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response(
                {"error": "Child profile not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Run evaluation to catch any newly unlocked achievements
        evaluate_child_achievements(child)

        earned_ids = set(ChildAchievement.objects.filter(child=child).values_list('achievement_id', flat=True))
        all_achievements = Achievement.objects.all()

        badge_list = []
        for ach in all_achievements:
            is_earned = ach.id in earned_ids
            earned_at = None
            if is_earned:
                ca = ChildAchievement.objects.filter(child=child, achievement=ach).first()
                if ca:
                    earned_at = ca.earned_at

            badge_list.append({
                "id": ach.id,
                "code": ach.code,
                "name": ach.name,
                "emoji": ach.emoji,
                "desc": ach.description,
                "earned": is_earned,
                "earned_at": earned_at
            })

        return Response(badge_list)
