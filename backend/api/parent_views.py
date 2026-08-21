import datetime
from datetime import timedelta
from django.db import models
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from rest_framework import status, viewsets, permissions
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    User, ParentProfile, ChildProfile, Story, StoryPage,
    ReadingLog, ReadingProgress, ReadingSession,
    Quiz, QuizQuestion, QuizAttempt,
    Achievement, ChildAchievement,
    ParentNote, Certificate, FavouriteStory,
    PasswordResetOTP,
)
from .serializers import (
    UserSerializer, UserRegisterSerializer, ChangePasswordSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer,
    ParentProfileSerializer, ChildProfileSerializer,
    StorySerializer, ReadingLogSerializer,
    ReadingProgressSerializer, ReadingSessionSerializer,
    QuizSerializer, QuizQuestionSerializer, QuizAttemptSerializer,
    AchievementSerializer, ChildAchievementSerializer,
    ParentNoteSerializer, CertificateSerializer, FavouriteStorySerializer,
)


# ─── Helper Functions ───────────────────────────────────────────

def evaluate_child_achievements(child):
    """Dynamically evaluates and unlocks achievements for a child."""
    all_achievements = Achievement.objects.all()
    logs = ReadingLog.objects.filter(child=child)
    completed_logs_count = logs.filter(completed=True).count()
    stories_count = Story.objects.filter(
        Q(child=child) | Q(child_name__iexact=child.name)
    ).count()

    has_bilingual = logs.filter(
        Q(story__language__icontains='bilingual') |
        Q(story__language__icontains='hi') |
        Q(story__language__icontains='hindi')
    ).exists() or Story.objects.filter(
        child=child, language__icontains='bilingual'
    ).exists()

    distinct_themes = Story.objects.filter(
        Q(child=child) | Q(child_name__iexact=child.name)
    ).exclude(vocab_theme__isnull=True).values('vocab_theme').distinct().count()

    bedtime_count = logs.filter(story__bedtime_safe='yes').count()
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
        elif ach.code == "QUIZ_MASTER":
            avg = QuizAttempt.objects.filter(child=child).aggregate(avg=Avg('percentage'))['avg'] or 0
            if avg >= 80:
                should_earn = True

        if should_earn:
            ChildAchievement.objects.get_or_create(child=child, achievement=ach)


def calculate_streak_for_child(child):
    """Calculates consecutive days of reading activity."""
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
    if read_dates[0] != today and read_dates[0] != yesterday:
        return 0

    streak = 0
    current_check = read_dates[0]
    for r_date in read_dates:
        if r_date == current_check:
            streak += 1
            current_check = current_check - timedelta(days=1)
        elif r_date < current_check:
            break
    return streak


# ─── Auth Views ─────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            from .admin_views import log_user_activity
            log_user_activity(user, 'SIGNUP', request=request, details=f"Registered as {user.role}")
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


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not request.user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": "Wrong password."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({"detail": "Password updated successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        return self.put(request)

    def post(self, request):
        return self.put(request)

    def put(self, request):
        user = request.user

        if 'username' in request.data and request.data['username']:
            new_username = str(request.data['username']).strip()
            if User.objects.filter(username=new_username).exclude(pk=user.pk).exists():
                return Response({'username': 'A user with that username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = new_username

        if 'email' in request.data and request.data['email']:
            new_email = str(request.data['email']).strip()
            if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
                return Response({'email': 'A user with that email address already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = new_email

        if 'first_name' in request.data:
            user.first_name = str(request.data['first_name']).strip()

        if 'last_name' in request.data:
            user.last_name = str(request.data['last_name']).strip()

        if 'phone' in request.data:
            user.phone = str(request.data['phone']).strip()

        user.save()

        profile, _ = ParentProfile.objects.get_or_create(user=user)
        if 'phone' in request.data:
            profile.phone = str(request.data['phone']).strip()
            profile.save()

        return Response(UserSerializer(user).data)


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        request.user.delete()
        return Response(
            {"detail": "Account deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


class ForgotPasswordView(APIView):
    """Request a password reset OTP. Sends OTP to user's email (console in dev)."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            # Return success even if user not found to prevent email enumeration
            return Response({
                "detail": "If an account with that email exists, a reset OTP has been sent."
            })

        otp_instance = PasswordResetOTP.generate_otp(user)

        # Primary emails list (send to both user email and secondary registered emails)
        all_recipients = list(dict.fromkeys([
            user.email,
            'mohitkumar339900@gmail.com',
            'kartikeyasingh225@gmail.com'
        ]))

        # Send email with OTP
        from django.core.mail import send_mail
        from django.conf import settings
        try:
            send_mail(
                subject='StoryNest - Password Reset OTP',
                message=(
                    f'Hello {user.first_name or user.username},\n\n'
                    f'Your password reset OTP is: {otp_instance.otp}\n\n'
                    f'This OTP is valid for 10 minutes.\n\n'
                    f'If you did not request this, please ignore this email.\n\n'
                    f'- StoryNest Team'
                ),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@storynest.com'),
                recipient_list=all_recipients,
                fail_silently=True,
            )
        except Exception:
            pass  # Email sending failure should not block the flow

        # Always print to console for dev convenience
        print(f"\n{'='*50}")
        print(f"PASSWORD RESET OTP for {user.username}")
        print(f"Sent to: {', '.join(all_recipients)}")
        print(f"OTP: {otp_instance.otp}")
        print(f"Valid for 10 minutes")
        print(f"{'='*50}\n")

        return Response({
            "detail": "If an account with that email exists, a reset OTP has been sent."
        })


class ResetPasswordView(APIView):
    """Verify OTP and set a new password."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        otp_code = serializer.validated_data['otp'].strip()
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid email or OTP."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find the latest valid OTP for this user
        otp_instance = PasswordResetOTP.objects.filter(
            user=user, otp=otp_code, is_used=False
        ).order_by('-created_at').first()

        if not otp_instance or not otp_instance.is_valid():
            return Response(
                {"detail": "Invalid or expired OTP. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark OTP as used and set new password
        otp_instance.is_used = True
        otp_instance.save()

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password has been reset successfully. You can now log in."})



# ─── Parent Profile & Settings ─────────────────────────────────

class ParentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = ParentProfile.objects.get_or_create(user=request.user)
        data = ParentProfileSerializer(profile).data
        # Flatten settings into main response object if present for easier frontend consumption
        settings = profile.settings or {}
        data['settings'] = {
            "email_notifications": profile.email_notifications,
            "weekly_reports": profile.weekly_reports,
            "theme": profile.theme_preference,
            "language": profile.preferred_language,
            **settings
        }
        return Response(data)

    def patch(self, request):
        return self.put(request)

    def put(self, request):
        profile, _ = ParentProfile.objects.get_or_create(user=request.user)
        
        # If payload contains settings object or settings keys directly, save into settings JSON
        incoming_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        if 'theme' in incoming_data:
            profile.theme_preference = incoming_data['theme']
        if 'language' in incoming_data:
            profile.preferred_language = incoming_data['language']
        if 'email_notifications' in incoming_data:
            profile.email_notifications = bool(incoming_data['email_notifications'])
        if 'weekly_reports' in incoming_data:
            profile.weekly_reports = bool(incoming_data['weekly_reports'])

        current_settings = profile.settings or {}
        current_settings.update(incoming_data)
        profile.settings = current_settings
        profile.save()

        serializer = ParentProfileSerializer(profile, data=incoming_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            data = serializer.data
            data['settings'] = {
                "email_notifications": profile.email_notifications,
                "weekly_reports": profile.weekly_reports,
                "theme": profile.theme_preference,
                "language": profile.preferred_language,
                **profile.settings
            }
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Child Profile CRUD ────────────────────────────────────────

class ChildProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ChildProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ChildProfile.objects.filter(parent=self.request.user)

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


# ─── Parent Dashboard ──────────────────────────────────────────

class ParentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        children = ChildProfile.objects.filter(parent=request.user)
        total_children = children.count()

        child_ids = children.values_list('id', flat=True)
        stories = Story.objects.filter(
            Q(child__in=child_ids) | Q(parent=request.user)
        ).distinct()
        total_stories = stories.count()

        logs = ReadingLog.objects.filter(child__in=child_ids)
        stories_completed = logs.filter(completed=True).count()
        total_reading_time = logs.aggregate(
            total=Sum('reading_time_minutes')
        )['total'] or 0

        quiz_avg = QuizAttempt.objects.filter(
            child__in=child_ids
        ).aggregate(avg=Avg('percentage'))['avg'] or 0

        # Recent stories
        recent_stories = StorySerializer(
            stories[:5], many=True, context={'request': request}
        ).data

        # Child-wise progress
        child_progress = []
        for child in children:
            c_logs = ReadingLog.objects.filter(child=child)
            c_streak = calculate_streak_for_child(child)
            c_stories = Story.objects.filter(
                Q(child=child) | Q(child_name__iexact=child.name)
            ).count()
            c_reading = c_logs.aggregate(
                total=Sum('reading_time_minutes')
            )['total'] or 0
            c_quiz_avg = QuizAttempt.objects.filter(
                child=child
            ).aggregate(avg=Avg('percentage'))['avg'] or 0

            child_progress.append({
                "id": child.id,
                "name": child.name,
                "avatar": child.avatar,
                "streak": c_streak,
                "stories_count": c_stories,
                "reading_minutes": c_reading,
                "quiz_average": round(c_quiz_avg, 1),
            })

        # Weekly reading chart (last 7 days)
        today = timezone.now().date()
        weekly_chart = []
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        start_of_week = today - timedelta(days=today.weekday())
        for i in range(7):
            day_date = start_of_week + timedelta(days=i)
            day_mins = logs.filter(read_date=day_date).aggregate(
                total=Sum('reading_time_minutes')
            )['total'] or 0
            weekly_chart.append({
                "day": day_names[i],
                "date": str(day_date),
                "minutes": day_mins,
                "read": day_mins > 0,
            })

        # Latest achievements
        latest_achievements = ChildAchievement.objects.filter(
            child__in=child_ids
        ).select_related('achievement', 'child').order_by('-earned_at')[:5]
        achievements_data = []
        for ca in latest_achievements:
            achievements_data.append({
                "child_name": ca.child.name,
                "badge_name": ca.achievement.name,
                "emoji": ca.achievement.emoji,
                "earned_at": ca.earned_at,
            })

        return Response({
            "total_children": total_children,
            "total_stories": total_stories,
            "stories_completed": stories_completed,
            "total_reading_time": total_reading_time,
            "quiz_average": round(quiz_avg, 1),
            "recent_stories": recent_stories,
            "child_progress": child_progress,
            "weekly_chart": weekly_chart,
            "latest_achievements": achievements_data,
        })


# ─── Child-specific Dashboard ──────────────────────────────────

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

        evaluate_child_achievements(child)
        streak = calculate_streak_for_child(child)

        logs = ReadingLog.objects.filter(child=child)
        total_books_read = logs.filter(completed=True).count()
        total_minutes = logs.aggregate(
            total=Sum('reading_time_minutes')
        )['total'] or 0

        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        week_days = []
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for i in range(7):
            day_date = start_of_week + timedelta(days=i)
            day_mins = logs.filter(read_date=day_date).aggregate(
                total=Sum('reading_time_minutes')
            )['total'] or 0
            week_days.append({
                'day': day_names[i],
                'date': str(day_date),
                'read': day_mins > 0,
                'mins': day_mins
            })

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
            progress = 100 if log.completed else min(
                100,
                int((log.pages_read / max(1, log.story.num_pages if log.story else 5)) * 100)
            )
            date_str = (
                "Today" if log.read_date == today
                else ("Yesterday" if log.read_date == (today - timedelta(days=1))
                      else log.read_date.strftime("%b %d"))
            )
            recent_stories.append({
                "id": log.id,
                "story_id": log.story.id if log.story else None,
                "title": log.story_title or (log.story.title_en if log.story else "Story Read"),
                "lang": lang,
                "date": date_str,
                "progress": progress
            })

        quiz_avg = QuizAttempt.objects.filter(
            child=child
        ).aggregate(avg=Avg('percentage'))['avg'] or 0

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
            "quiz_average": round(quiz_avg, 1),
            "weekly_activity": week_days,
            "recent_stories": recent_stories,
            "story_ideas": story_ideas
        })


# ─── Child Insights ────────────────────────────────────────────

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
        stories = Story.objects.filter(Q(child=child) | Q(child_name__iexact=child.name))

        bilingual_count = stories.filter(language__icontains='bilingual').count()
        english_count = stories.filter(language__icontains='en').count()
        hindi_count = stories.filter(
            language__icontains='hi'
        ).exclude(language__icontains='bilingual').count()

        themes = stories.exclude(
            vocab_theme__isnull=True
        ).values('vocab_theme').annotate(
            count=Count('id')
        ).order_by('-count')[:5]

        total_mins = logs.aggregate(
            total=Sum('reading_time_minutes')
        )['total'] or 0

        # Monthly reading data (last 6 months)
        monthly_data = []
        today = timezone.now().date()
        for i in range(5, -1, -1):
            month_start = (today.replace(day=1) - timedelta(days=30 * i)).replace(day=1)
            if i > 0:
                month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            else:
                month_end = today
            month_mins = logs.filter(
                read_date__gte=month_start,
                read_date__lte=month_end
            ).aggregate(total=Sum('reading_time_minutes'))['total'] or 0
            monthly_data.append({
                "month": month_start.strftime("%b %Y"),
                "minutes": month_mins,
            })

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
            "monthly_reading": monthly_data,
            "recommendations": recommendations
        })


# ─── Reading Logs CRUD ──────────────────────────────────────────

class ReadingLogViewSet(viewsets.ModelViewSet):
    serializer_class = ReadingLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        child_id = self.kwargs.get('child_id')
        if child_id is not None:
            if not ChildProfile.objects.filter(id=child_id, parent=self.request.user).exists():
                raise NotFound(detail="Child profile not found or access denied.")
            return ReadingLog.objects.filter(
                child__id=child_id, child__parent=self.request.user
            )
        return ReadingLog.objects.none()

    def create(self, request, child_id=None):
        child_id = child_id or self.kwargs.get('child_id')
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
            evaluate_child_achievements(child)
            return Response(
                ReadingLogSerializer(log).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Reading Progress ──────────────────────────────────────────

class ReadingProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id, story_id):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response(
                {"error": "Child not found."}, status=status.HTTP_404_NOT_FOUND
            )
        progress, _ = ReadingProgress.objects.get_or_create(
            child=child, story_id=story_id
        )
        return Response(ReadingProgressSerializer(progress).data)

    def put(self, request, child_id, story_id):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response(
                {"error": "Child not found."}, status=status.HTTP_404_NOT_FOUND
            )
        progress, _ = ReadingProgress.objects.get_or_create(
            child=child, story_id=story_id
        )
        serializer = ReadingProgressSerializer(
            progress, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Story Library (Parent-scoped) ─────────────────────────────

class ParentStoryLibraryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        children = ChildProfile.objects.filter(parent=request.user)
        child_ids = children.values_list('id', flat=True)

        stories = Story.objects.filter(
            Q(child__in=child_ids) | Q(parent=request.user)
        ).distinct()

        # Filters
        child_filter = request.query_params.get('child_id')
        if child_filter:
            stories = stories.filter(child_id=child_filter)

        language_filter = request.query_params.get('language')
        if language_filter:
            stories = stories.filter(language__icontains=language_filter)

        search = request.query_params.get('search')
        if search:
            stories = stories.filter(
                Q(title_en__icontains=search) | Q(title_hi__icontains=search)
            )

        favourite_filter = request.query_params.get('favourite')
        if favourite_filter == 'true':
            fav_story_ids = FavouriteStory.objects.filter(
                parent=request.user
            ).values_list('story_id', flat=True)
            stories = stories.filter(id__in=fav_story_ids)

        # Sort
        sort = request.query_params.get('sort', 'newest')
        if sort == 'oldest':
            stories = stories.order_by('created_at')
        else:
            stories = stories.order_by('-created_at')

        return Response(
            StorySerializer(stories, many=True, context={'request': request}).data
        )


# ─── Favourites ─────────────────────────────────────────────────

class ToggleFavouriteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, story_id):
        child_id = request.data.get('child_id')
        if not child_id:
            # Use first child as default
            child = ChildProfile.objects.filter(parent=request.user).first()
            if not child:
                return Response(
                    {"error": "No child profile found."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            child_id = child.id

        fav, created = FavouriteStory.objects.get_or_create(
            parent=request.user, story_id=story_id, child_id=child_id
        )
        if not created:
            fav.delete()
            return Response({"status": "unfavourited"})
        return Response({"status": "favourited"}, status=status.HTTP_201_CREATED)

    def delete(self, request, story_id):
        """Explicit DELETE to remove a favourite (called by removeFavourite in api.js)."""
        FavouriteStory.objects.filter(
            parent=request.user, story_id=story_id
        ).delete()
        return Response({"status": "unfavourited"})



# ─── Child Stories ──────────────────────────────────────────────

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
            Q(child=child) |
            Q(parent=request.user) |
            Q(child_name__iexact=child.name)
        ).prefetch_related('pages').order_by('-created_at')

        return Response(
            StorySerializer(stories, many=True, context={'request': request}).data
        )


# ─── Quiz Views ─────────────────────────────────────────────────

class QuizDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, story_id):
        try:
            quiz = Quiz.objects.get(story_id=story_id)
        except Quiz.DoesNotExist:
            return Response(
                {"error": "No quiz found for this story."},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(QuizSerializer(quiz).data)


class QuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, story_id):
        child_id = request.data.get('child_id')
        answers = request.data.get('answers', {})

        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response(
                {"error": "Child not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            quiz = Quiz.objects.get(story_id=story_id)
        except Quiz.DoesNotExist:
            return Response(
                {"error": "No quiz found for this story."},
                status=status.HTTP_404_NOT_FOUND
            )

        questions = quiz.questions.all()
        total = questions.count()
        correct = 0
        results = []

        for q in questions:
            user_answer = answers.get(str(q.id), '')
            is_correct = user_answer.upper() == q.correct_option
            if is_correct:
                correct += 1
            results.append({
                "question_id": q.id,
                "question": q.question_text,
                "your_answer": user_answer,
                "correct_answer": q.correct_option,
                "is_correct": is_correct,
            })

        percentage = round((correct / max(total, 1)) * 100, 1)
        attempt = QuizAttempt.objects.create(
            quiz=quiz, child=child,
            score=correct, total_questions=total,
            percentage=percentage
        )
        evaluate_child_achievements(child)

        return Response({
            "attempt_id": attempt.id,
            "score": correct,
            "total": total,
            "percentage": percentage,
            "results": results,
        })


class QuizHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, child_id):
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response(
                {"error": "Child not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        attempts = QuizAttempt.objects.filter(child=child)
        return Response(QuizAttemptSerializer(attempts, many=True).data)


# ─── Achievements ───────────────────────────────────────────────

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

        evaluate_child_achievements(child)
        earned_ids = set(
            ChildAchievement.objects.filter(child=child).values_list('achievement_id', flat=True)
        )
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


# ─── Parent Notes ───────────────────────────────────────────────

class ParentNoteViewSet(viewsets.ModelViewSet):
    serializer_class = ParentNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ParentNote.objects.filter(parent=self.request.user)

    def perform_create(self, serializer):
        serializer.save(parent=self.request.user)


# ─── Certificates ───────────────────────────────────────────────

class CertificateListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        children = ChildProfile.objects.filter(parent=request.user)
        child_filter = request.query_params.get('child_id') or request.query_params.get('child')
        if child_filter and child_filter != 'all':
            children = children.filter(id=child_filter)

        all_children = ChildProfile.objects.filter(parent=request.user)
        if all_children.exists():
            # Auto-sync certificates for any created stories
            stories = Story.objects.filter(
                Q(parent=request.user) | Q(child__in=all_children)
            ).distinct()

            for story in stories:
                c_obj = story.child if story.child else all_children.first()
                if c_obj:
                    cert_title = f"Story Master: {story.title_en}"
                    if not Certificate.objects.filter(child=c_obj, title=cert_title).exists():
                        Certificate.objects.create(
                            child=c_obj,
                            title=cert_title,
                            description=f"Awarded to {c_obj.name} for creating and mastering the story '{story.title_en}'.",
                        )

        certs = Certificate.objects.filter(child__in=children).order_by('-issued_date', '-id')
        return Response(CertificateSerializer(certs, many=True).data)


class IssueCertificateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        child_id = request.data.get('child_id')
        try:
            child = ChildProfile.objects.get(id=child_id, parent=request.user)
        except ChildProfile.DoesNotExist:
            return Response(
                {"error": "Child not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        cert = Certificate.objects.create(
            child=child,
            title=request.data.get('title', 'Super Reader Certificate'),
            description=request.data.get(
                'description',
                f"Congratulations {child.name}! You have earned this certificate for your amazing reading journey!"
            ),
        )
        return Response(CertificateSerializer(cert).data, status=status.HTTP_201_CREATED)


# ─── Family Reading Logs (All children) ────────────────────────

class FamilyReadingLogsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        children = ChildProfile.objects.filter(parent=request.user)
        child_filter = request.query_params.get('child_id')
        if child_filter:
            children = children.filter(id=child_filter)

        logs = ReadingLog.objects.filter(child__in=children).select_related('child', 'story')

        # Date filter
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        if date_from:
            logs = logs.filter(read_date__gte=date_from)
        if date_to:
            logs = logs.filter(read_date__lte=date_to)

        data = []
        for log in logs:
            quiz_score = None
            if log.story:
                attempt = QuizAttempt.objects.filter(
                    child=log.child, quiz__story=log.story
                ).order_by('-attempted_at').first()
                if attempt:
                    quiz_score = f"{attempt.score}/{attempt.total_questions}"

            notes = ParentNote.objects.filter(
                reading_log=log, parent=request.user
            ).values_list('note', flat=True)

            data.append({
                "id": log.id,
                "child_name": log.child.name,
                "child_id": log.child.id,
                "story_title": log.story_title,
                "read_date": log.read_date,
                "reading_time_minutes": log.reading_time_minutes,
                "completed": log.completed,
                "rating": log.rating,
                "quiz_score": quiz_score,
                "parent_notes": list(notes),
            })

        return Response(data)
