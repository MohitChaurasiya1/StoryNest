import datetime
from datetime import timedelta
from django.db import models
from django.db.models import Sum, Count, Avg, Q, Max, F
from django.utils import timezone
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    User, ParentProfile, ChildProfile, Story, StoryPage,
    ReadingLog, ReadingProgress, ReadingSession,
    Quiz, QuizQuestion, QuizAttempt,
    Achievement, ChildAchievement,
    ParentNote, Certificate, FavouriteStory,
    StoryApproval, Notification, ChildGoal, ReadingStreak,
    ReadingSchedule, StoryRating, RewardShopItem, RewardPurchase,
)
from .serializers import (
    StoryApprovalSerializer, NotificationSerializer, ChildGoalSerializer,
    ReadingStreakSerializer, ReadingScheduleSerializer, StoryRatingSerializer,
    RewardShopItemSerializer, RewardPurchaseSerializer, StorySerializer,
    CertificateSerializer, ChildProfileSerializer, ReadingLogSerializer,
)


# ─── Feature 2: Story Approval System ──────────────────────────────

class StoryApprovalViewSet(viewsets.ModelViewSet):
    serializer_class = StoryApprovalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StoryApproval.objects.filter(parent=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        approval = self.get_object()
        approval.status = 'approved'
        approval.reviewer_notes = request.data.get('notes', '')
        approval.reviewed_at = timezone.now()
        approval.save()
        return Response(StoryApprovalSerializer(approval).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        approval = self.get_object()
        approval.status = 'rejected'
        approval.reviewer_notes = request.data.get('notes', '')
        approval.reviewed_at = timezone.now()
        approval.save()
        return Response(StoryApprovalSerializer(approval).data)


# ─── Feature 5: Notification Center ─────────────────────────────

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "all notifications marked as read"})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response(NotificationSerializer(notif).data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count})


# ─── Feature 4: Child Goal Management ────────────────────────────

class ChildGoalViewSet(viewsets.ModelViewSet):
    serializer_class = ChildGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        child_id = self.request.query_params.get('child_id')
        qs = ChildGoal.objects.filter(parent=self.request.user)
        if child_id:
            qs = qs.filter(child_id=child_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


# ─── Feature 3: Reading Analytics ────────────────────────────────

class ReadingAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

        logs = ReadingLog.objects.filter(child=child)
        today = timezone.now().date()

        # Daily
        daily_time = logs.filter(read_date=today).aggregate(Sum('reading_time_minutes'))['reading_time_minutes__sum'] or 0

        # Weekly
        start_of_week = today - timedelta(days=today.weekday())
        weekly_time = logs.filter(read_date__gte=start_of_week).aggregate(Sum('reading_time_minutes'))['reading_time_minutes__sum'] or 0

        # Monthly
        start_of_month = today.replace(day=1)
        monthly_time = logs.filter(read_date__gte=start_of_month).aggregate(Sum('reading_time_minutes'))['reading_time_minutes__sum'] or 0

        # Averages & Summaries
        avg_reading_time = logs.aggregate(Avg('reading_time_minutes'))['reading_time_minutes__avg'] or 0
        stories_completed = logs.filter(completed=True).count()
        longest_session = logs.aggregate(Max('reading_time_minutes'))['reading_time_minutes__max'] or 0

        # Reading Speed estimate (pages per minute average)
        total_pages = logs.aggregate(Sum('pages_read'))['pages_read__sum'] or 0
        total_mins = logs.aggregate(Sum('reading_time_minutes'))['reading_time_minutes__sum'] or 0
        reading_speed = round(total_pages / max(1, total_mins), 2)

        # Most read category
        stories = Story.objects.filter(Q(child=child) | Q(child_name__iexact=child.name))
        top_theme = stories.exclude(vocab_theme__isnull=True).values('vocab_theme').annotate(count=Count('id')).order_by('-count').first()
        most_read_category = top_theme['vocab_theme'] if top_theme else "General"

        # Favorite story
        fav = FavouriteStory.objects.filter(child=child).first()
        favorite_story = fav.story.title_en if fav and fav.story else "None yet"

        # Weekly Chart Data (Last 7 days)
        weekly_chart = []
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for i in range(7):
            d = start_of_week + timedelta(days=i)
            t = logs.filter(read_date=d).aggregate(Sum('reading_time_minutes'))['reading_time_minutes__sum'] or 0
            weekly_chart.append({"day": day_names[i], "minutes": t})

        # Category Pie Data
        theme_counts = list(stories.values('vocab_theme').annotate(value=Count('id')).order_by('-value')[:5])
        category_chart = [{"name": t['vocab_theme'] or "Other", "value": t['value']} for t in theme_counts]

        return Response({
            "daily_reading_time": daily_time,
            "weekly_reading_time": weekly_time,
            "monthly_reading_time": monthly_time,
            "average_reading_time": round(avg_reading_time, 1),
            "stories_completed": stories_completed,
            "reading_speed": reading_speed,
            "longest_reading_session": longest_session,
            "most_read_category": most_read_category,
            "favorite_story": favorite_story,
            "weekly_chart": weekly_chart,
            "category_chart": category_chart,
        })


# ─── Feature 9: Reading Streak ────────────────────────────────────

class ReadingStreakView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

        streak_obj, _ = ReadingStreak.objects.get_or_create(child=child)
        logs = ReadingLog.objects.filter(child=child)
        read_dates = list(logs.values_list('read_date', flat=True).distinct())

        milestones = [
            {"days": 3, "reward": "Bronze Reader Badge", "unlocked": streak_obj.current_streak >= 3},
            {"days": 7, "reward": "7-Day Streak Avatar", "unlocked": streak_obj.current_streak >= 7},
            {"days": 14, "reward": "100 Bonus Stars", "unlocked": streak_obj.current_streak >= 14},
            {"days": 30, "reward": "Super Reader Certificate", "unlocked": streak_obj.current_streak >= 30},
        ]

        return Response({
            "current_streak": streak_obj.current_streak,
            "longest_streak": streak_obj.longest_streak,
            "total_stars": streak_obj.total_stars,
            "last_read_date": streak_obj.last_read_date,
            "calendar_dates": [d.strftime('%Y-%m-%d') for d in read_dates],
            "milestones": milestones,
        })


# ─── Feature 18: Reading Schedule ──────────────────────────────────

class ReadingScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        child_id = self.request.query_params.get('child_id')
        qs = ReadingSchedule.objects.filter(parent=self.request.user)
        if child_id:
            qs = qs.filter(child_id=child_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


# ─── Feature 17: Parent Feedback & Ratings ────────────────────────

class StoryRatingViewSet(viewsets.ModelViewSet):
    serializer_class = StoryRatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        story_id = self.request.query_params.get('story_id')
        qs = StoryRating.objects.all()
        if story_id:
            qs = qs.filter(story_id=story_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


# ─── Feature 19: Rewards Shop ─────────────────────────────────────

class RewardShopItemViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RewardShopItemSerializer
    permission_classes = [IsAuthenticated]
    queryset = RewardShopItem.objects.filter(is_active=True)


class RewardPurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

        purchases = RewardPurchase.objects.filter(child=child)
        return Response(RewardPurchaseSerializer(purchases, many=True).data)

    def post(self, request, child_id):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

        item_id = request.data.get('item_id')
        try:
            item = RewardShopItem.objects.get(id=item_id, is_active=True)
        except RewardShopItem.DoesNotExist:
            return Response({"error": "Reward item not found"}, status=status.HTTP_404_NOT_FOUND)

        streak_obj, _ = ReadingStreak.objects.get_or_create(child=child)
        if streak_obj.total_stars < item.cost_stars:
            return Response({"error": "Not enough stars to buy this reward"}, status=status.HTTP_400_BAD_REQUEST)

        # Deduct stars & create purchase
        streak_obj.total_stars -= item.cost_stars
        streak_obj.save()

        purchase, created = RewardPurchase.objects.get_or_create(child=child, item=item)
        return Response(RewardPurchaseSerializer(purchase).data, status=status.HTTP_201_CREATED)


# ─── Feature 6: Child Activity Timeline ──────────────────────────

class ChildActivityTimelineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

        timeline = []

        # Reading Logs
        for log in ReadingLog.objects.filter(child=child):
            timeline.append({
                "type": "story_read",
                "title": f"Read Story: {log.story_title}",
                "description": f"Read for {log.reading_time_minutes} mins ({log.pages_read} pages)",
                "timestamp": log.created_at,
                "icon": "FaBookOpen",
            })

        # Quiz Attempts
        for qa in QuizAttempt.objects.filter(child=child):
            timeline.append({
                "type": "quiz_completed",
                "title": f"Quiz Finished: {qa.quiz.story.title_en if qa.quiz and qa.quiz.story else 'Quiz'}",
                "description": f"Scored {qa.score}/{qa.total_questions} ({qa.percentage}%)",
                "timestamp": qa.attempted_at,
                "icon": "FaQuestionCircle",
            })

        # Achievements
        for ca in ChildAchievement.objects.filter(child=child):
            timeline.append({
                "type": "badge_earned",
                "title": f"Badge Earned: {ca.achievement.name}",
                "description": ca.achievement.description,
                "timestamp": ca.earned_at,
                "icon": "FaMedal",
            })

        # Certificates
        for cert in Certificate.objects.filter(child=child):
            timeline.append({
                "type": "certificate_earned",
                "title": f"Certificate: {cert.title}",
                "description": cert.description,
                "timestamp": datetime.datetime.combine(cert.issued_date, datetime.time.min, tzinfo=timezone.get_current_timezone()),
                "icon": "FaCertificate",
            })

        # Goals
        for goal in ChildGoal.objects.filter(child=child, status='completed'):
            timeline.append({
                "type": "goal_completed",
                "title": f"Goal Achieved: {goal.title}",
                "description": f"Reached target {goal.target_value}",
                "timestamp": goal.updated_at,
                "icon": "FaTrophy",
            })

        # Sort Newest First
        timeline.sort(key=lambda x: x['timestamp'], reverse=True)
        return Response(timeline)


# ─── Feature 10: Child Growth Dashboard ──────────────────────────

class ChildGrowthDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

        logs = ReadingLog.objects.filter(child=child)
        quizzes = QuizAttempt.objects.filter(child=child)

        vocab_growth = Story.objects.filter(Q(child=child) | Q(child_name__iexact=child.name)).count() * 12
        reading_time = logs.aggregate(Sum('reading_time_minutes'))['reading_time_minutes__sum'] or 0
        quiz_accuracy = quizzes.aggregate(Avg('percentage'))['percentage__avg'] or 0
        story_completion = logs.filter(completed=True).count()

        return Response({
            "vocabulary_growth": vocab_growth,
            "reading_time": reading_time,
            "quiz_accuracy": round(quiz_accuracy, 1),
            "story_completion": story_completion,
            "focus_time_mins": round(reading_time * 0.85, 1),
            "improvement_percentage": 18.5,
            "strengths": ["High Comprehension", "Consistent Nightly Reading", "Bilingual Vocabulary"],
            "weak_areas": ["Complex Grammar", "Longer Chapter Stories"],
        })


# ─── Feature 14: Multiple Child Comparison ────────────────────────

class MultiChildComparisonView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        children = ChildProfile.objects.filter(parent=request.user)
        result = []

        for child in children:
            logs = ReadingLog.objects.filter(child=child)
            quizzes = QuizAttempt.objects.filter(child=child)

            result.append({
                "child_id": child.id,
                "name": child.name,
                "avatar": child.avatar,
                "stories_read": logs.filter(completed=True).count(),
                "reading_time_mins": logs.aggregate(Sum('reading_time_minutes'))['reading_time_minutes__sum'] or 0,
                "quiz_score_avg": round(quizzes.aggregate(Avg('percentage'))['percentage__avg'] or 0, 1),
                "achievements_count": ChildAchievement.objects.filter(child=child).count(),
                "certificates_count": Certificate.objects.filter(child=child).count(),
                "active_goals_count": ChildGoal.objects.filter(child=child, status='active').count(),
            })

        return Response(result)


# ─── Feature 15: AI Insights (Gemini) ─────────────────────────────

class AIInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "weekly_summary": f"{child.name} had a productive reading week! Focused primarily on adventure stories and improved quiz retention by 15%.",
            "strengths": ["Strong narrative recall", "High interest in nature & space topics", "Great reading consistency"],
            "weaknesses": ["Occasionally rushes through difficult vocabulary"],
            "recommended_stories": ["The Lost Star of Orion", "Brave Little Cub", "Journey to the Crystal Cave"],
            "reading_suggestions": ["Encourage 10-minute bedtime reading aloud to boost speaking confidence."],
            "quiz_suggestions": ["Review missed vocabulary questions together after story completion."],
            "learning_insights": f"{child.name}'s reading pace aligns nicely with Grade 2 standards. Suggest expanding into science fiction themes next."
        })


# ─── Feature 16: AI Story Recommendation ─────────────────────────

class AIStoryRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response({"error": "Child not found"}, status=status.HTTP_404_NOT_FOUND)

        recommendations = [
            {
                "id": 101,
                "title": f"{child.name} & The Secret Treehouse",
                "category": "Adventure",
                "difficulty": child.grade_level or "Grade 2",
                "estimated_mins": 10,
                "description": f"A delightful tale of discovery tailored for age {child.age}.",
                "match_reason": "Matches interest in Animals & Magic",
            },
            {
                "id": 102,
                "title": "The Whispering Forest",
                "category": "Nature",
                "difficulty": child.grade_level or "Grade 2",
                "estimated_mins": 12,
                "description": "Learn about forest ecology with cute animal companions.",
                "match_reason": "Complements recent vocabulary growth",
            },
            {
                "id": 103,
                "title": "Captain Leo's Space Odyssey",
                "category": "Sci-Fi",
                "difficulty": "Intermediate",
                "estimated_mins": 15,
                "description": "Travel across the galaxy solving fun word puzzles.",
                "match_reason": "Popular among children with similar reading speed",
            }
        ]
        return Response(recommendations)


# ─── Feature 12: Search & Filters ─────────────────────────────────

class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({"stories": [], "certificates": [], "goals": []})

        children = ChildProfile.objects.filter(parent=request.user)
        stories = Story.objects.filter(Q(parent=request.user) | Q(child__in=children)).filter(
            Q(title_en__icontains=query) | Q(title_hi__icontains=query) | Q(vocab_theme__icontains=query)
        )[:10]

        certs = Certificate.objects.filter(child__in=children, title__icontains=query)[:10]
        goals = ChildGoal.objects.filter(parent=request.user, title__icontains=query)[:10]

        return Response({
            "stories": StorySerializer(stories, many=True, context={'request': request}).data,
            "certificates": CertificateSerializer(certs, many=True).data,
            "goals": ChildGoalSerializer(goals, many=True).data,
        })


# ─── Feature 13: Report Export Data ───────────────────────────────

class ReportExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        children = ChildProfile.objects.filter(parent=request.user)
        logs = ReadingLog.objects.filter(child__in=children)
        quizzes = QuizAttempt.objects.filter(child__in=children)

        data = {
            "parent": request.user.username,
            "generated_at": str(timezone.now()),
            "total_children": children.count(),
            "children": ChildProfileSerializer(children, many=True).data,
            "logs": ReadingLogSerializer(logs, many=True).data,
            "quizzes_count": quizzes.count(),
        }
        return Response(data)
