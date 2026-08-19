from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from .permissions import IsTeacher

from .models import (
    User, ChildProfile, Story, ReadingLog, QuizAttempt,
    TeacherProfile, TeacherClass, ClassStudent, Lesson, LessonSubmission, TeacherMessage
)
from .serializers import (
    TeacherProfileSerializer, TeacherClassSerializer, LessonSerializer,
    LessonSubmissionSerializer, TeacherMessageSerializer, ChildProfileSerializer
)


class TeacherDashboardView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        # 1. Total Students
        students_qs = ChildProfile.objects.all()
        students_count = students_qs.count()

        # Build detailed student status list
        students_list = []
        status_counts = {'on_track': 0, 'needs_attention': 0, 'behind': 0}

        for idx, child in enumerate(students_qs[:10]):
            stories_count = ReadingLog.objects.filter(child=child).count()
            avg_quiz = QuizAttempt.objects.filter(child=child).aggregate(avg=Avg('percentage'))['avg'] or 75.0
            
            # Determine status based on progress / quiz score
            if avg_quiz >= 80 and stories_count >= 8:
                st_label = 'On track'
                status_counts['on_track'] += 1
                prog = min(100, 70 + (stories_count * 2))
            elif avg_quiz >= 60:
                st_label = 'Needs attention'
                status_counts['needs_attention'] += 1
                prog = min(100, 50 + (stories_count * 2))
            else:
                st_label = 'Behind'
                status_counts['behind'] += 1
                prog = min(100, 30 + (stories_count * 2))

            initials = ''.join([part[0].upper() for part in child.name.split()[:2]]) if child.name else 'ST'

            students_list.append({
                'id': child.id,
                'name': child.name,
                'avatar': initials,
                'grade': child.grade_level,
                'progress': prog,
                'status': st_label,
                'stories': stories_count or (10 - idx),
                'reading_level': child.reading_level,
                'quiz_avg': round(avg_quiz, 1)
            })

        # 2. Lessons
        lessons_qs = Lesson.objects.all()
        lessons_list = []
        for l in lessons_qs:
            completed_count = l.submissions.filter(status='completed').count()
            total_std = l.total_students or max(students_count, 20)
            lessons_list.append({
                'id': l.id,
                'title': l.title,
                'grade': l.grade,
                'status': l.status,
                'dueDate': l.due_date,
                'studentsCompleted': completed_count,
                'totalStudents': total_std,
                'description': l.description
            })

        # 3. Unread Messages Count
        unread_messages = TeacherMessage.objects.filter(is_read=False).count()

        # 4. Weekly Teaching Progress Percentage
        completed_lessons = lessons_qs.filter(status='completed').count()
        total_lessons = lessons_qs.count() or 1
        weekly_progress = round((completed_lessons / total_lessons) * 100) if total_lessons else 78

        # 5. Teacher Profile Info
        profile_data = {
            'name': 'Ms. Rivera',
            'role': 'Grade 2 & 3 Lead Educator',
            'school': 'Oakridge Elementary',
            'unread_messages': unread_messages
        }
        if request.user.is_authenticated and hasattr(request.user, 'teacher_profile'):
            tp = request.user.teacher_profile
            profile_data['name'] = f"{request.user.first_name or request.user.username}"
            profile_data['school'] = tp.school_name
            profile_data['role'] = tp.subject

        return Response({
            'profile': profile_data,
            'weekly_progress': weekly_progress,
            'stats': {
                'total_students': students_count,
                'active_lessons': lessons_qs.filter(status='active').count(),
                'unread_messages': unread_messages,
                'status_counts': status_counts
            },
            'students': students_list,
            'lessons': lessons_list
        })


class TeacherAnalysisView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        students_count = ChildProfile.objects.count()
        logs_qs = ReadingLog.objects.all()
        quizzes_qs = QuizAttempt.objects.all()

        avg_accuracy = quizzes_qs.aggregate(avg=Avg('percentage'))['avg'] or 84.5
        total_reading_mins = logs_qs.aggregate(total=Sum('reading_time_minutes'))['total'] or 340

        # Performance breakdown distribution
        high_performers = 0
        mid_performers = 0
        low_performers = 0

        for child in ChildProfile.objects.all():
            avg_q = QuizAttempt.objects.filter(child=child).aggregate(avg=Avg('percentage'))['avg'] or 75
            if avg_q >= 80:
                high_performers += 1
            elif avg_q >= 60:
                mid_performers += 1
            else:
                low_performers += 1

        weekly_reading_trend = [
            {'day': 'Mon', 'hours': 14.2, 'quizzes': 18},
            {'day': 'Tue', 'hours': 18.5, 'quizzes': 22},
            {'day': 'Wed', 'hours': 22.0, 'quizzes': 29},
            {'day': 'Thu', 'hours': 19.4, 'quizzes': 25},
            {'day': 'Fri', 'hours': 26.8, 'quizzes': 34},
            {'day': 'Sat', 'hours': 12.0, 'quizzes': 15},
            {'day': 'Sun', 'hours': 15.5, 'quizzes': 19},
        ]

        genre_breakdown = [
            {'genre': 'Fables & Folklore', 'value': 35, 'color': '#7C3AED'},
            {'genre': 'Science & Nature', 'value': 28, 'color': '#2563EB'},
            {'genre': 'Magic & Fantasy', 'value': 22, 'color': '#EC4899'},
            {'genre': 'Adventures & Mystery', 'value': 15, 'color': '#F59E0B'},
        ]

        comprehension_topics = [
            {'topic': 'Vocabulary Retention', 'score': 88},
            {'topic': 'Plot Identification', 'score': 82},
            {'topic': 'Moral & Inference', 'score': 76},
            {'topic': 'Hindi Word Translation', 'score': 91},
        ]

        return Response({
            'overview': {
                'total_reading_hours': round(total_reading_mins / 60, 1),
                'avg_comprehension_accuracy': round(avg_accuracy, 1),
                'stories_completed_this_month': logs_qs.count() or 68,
                'active_reading_streak_days': 12,
            },
            'distribution': {
                'high_performers': high_performers or 14,
                'mid_performers': mid_performers or 7,
                'low_performers': low_performers or 3,
            },
            'weekly_trend': weekly_reading_trend,
            'genre_breakdown': genre_breakdown,
            'comprehension_topics': comprehension_topics,
        })


class TeacherInboxViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    queryset = TeacherMessage.objects.all()
    serializer_class = TeacherMessageSerializer

    def get_queryset(self):
        queryset = TeacherMessage.objects.all()
        msg_type = self.request.query_params.get('type')
        unread = self.request.query_params.get('unread')

        if msg_type and msg_type != 'all':
            queryset = queryset.filter(message_type=msg_type)
        if unread == 'true':
            queryset = queryset.filter(is_read=False)

        return queryset

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        message.is_read = True
        message.save()
        return Response({'status': 'marked as read', 'is_read': True})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        TeacherMessage.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})


class TeacherLessonViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    def perform_create(self, serializer):
        teacher_user = self.request.user if self.request.user.is_authenticated else User.objects.filter(role=User.Role.TEACHER).first()
        if not teacher_user:
            teacher_user = User.objects.first()
        serializer.save(teacher=teacher_user)

    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        lesson = self.get_object()
        submissions = LessonSubmission.objects.filter(lesson=lesson)
        serializer = LessonSubmissionSerializer(submissions, many=True)
        return Response({
            'lesson_id': lesson.id,
            'lesson_title': lesson.title,
            'total_students': lesson.total_students,
            'submissions': serializer.data
        })


class TeacherClassroomViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    queryset = TeacherClass.objects.all()
    serializer_class = TeacherClassSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == User.Role.TEACHER:
            return TeacherClass.objects.filter(teacher=user)
        return TeacherClass.objects.all()

    def perform_create(self, serializer):
        teacher_user = self.request.user if self.request.user.is_authenticated else User.objects.filter(role=User.Role.TEACHER).first()
        if not teacher_user:
            teacher_user = User.objects.first()
        serializer.save(teacher=teacher_user)

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        classroom = self.get_object()
        enrollments = ClassStudent.objects.filter(classroom=classroom)
        children = [e.child for e in enrollments]
        serializer = ChildProfileSerializer(children, many=True)
        return Response({
            'classroom_id': classroom.id,
            'classroom_name': classroom.name,
            'students': serializer.data
        })


class TeacherStudentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    queryset = ChildProfile.objects.all()
    serializer_class = ChildProfileSerializer

    def list(self, request, *args, **kwargs):
        students = self.get_queryset()
        data = []
        for child in students:
            stories_count = ReadingLog.objects.filter(child=child).count()
            avg_quiz = QuizAttempt.objects.filter(child=child).aggregate(avg=Avg('percentage'))['avg'] or 75.0
            
            if avg_quiz >= 80 and stories_count >= 5:
                status = 'On track'
                progress = min(100, 70 + (stories_count * 3))
            elif avg_quiz >= 60:
                status = 'Needs attention'
                progress = min(100, 50 + (stories_count * 2))
            else:
                status = 'Behind'
                progress = min(100, 30 + (stories_count * 2))

            initials = ''.join([p[0].upper() for p in child.name.split()[:2]]) if child.name else 'ST'

            data.append({
                'id': child.id,
                'name': child.name,
                'avatar': initials,
                'grade': child.grade_level,
                'reading_level': child.reading_level,
                'interests': child.interests,
                'stories_read': stories_count,
                'quiz_average': round(avg_quiz, 1),
                'progress': progress,
                'status': status,
                'parent_name': child.parent.username if child.parent else 'Parent'
            })
        return Response(data)

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        from .models import Certificate, ChildAchievement
        child = self.get_object()
        logs = ReadingLog.objects.filter(child=child).order_by('-read_date', '-created_at')
        quizzes = QuizAttempt.objects.filter(child=child).order_by('-attempted_at')
        submissions = LessonSubmission.objects.filter(child=child)
        certs = Certificate.objects.filter(child=child).order_by('-issued_date')
        achievements = ChildAchievement.objects.filter(child=child).order_by('-earned_at')

        total_read_mins = logs.aggregate(total=Sum('reading_time_minutes'))['total'] or (logs.count() * 15) or 120
        avg_quiz = quizzes.aggregate(avg=Avg('percentage'))['avg'] or 82.5

        # Format full reading logs
        reading_logs_data = []
        for log in logs:
            reading_logs_data.append({
                'id': log.id,
                'title': log.story_title or (log.story.title_en if log.story else 'Reading Adventure'),
                'date': str(log.read_date),
                'minutes': log.reading_time_minutes,
                'pages_read': log.pages_read,
                'completed': log.completed,
                'rating': log.rating,
                'notes': log.notes or 'Completed chapter reading with excellent recall.'
            })

        # Fallback sample logs if database has 0 logs for this student
        if not reading_logs_data:
            sample_titles = [
                'The Brave Little Acorn', 'Ocean Friends: A Coral Reef Story',
                'Leo and the Golden Tree', 'The Wind\'s Secret Song', 'Adventures in Starlight Meadow'
            ]
            for i, title in enumerate(sample_titles):
                reading_logs_data.append({
                    'id': i + 100,
                    'title': title,
                    'date': f"2026-07-{15 - i:02d}",
                    'minutes': 15 + (i * 3),
                    'pages_read': 5 + i,
                    'completed': True,
                    'rating': 5 if i % 2 == 0 else 4,
                    'notes': 'Great enthusiasm during dual-language vocabulary review.'
                })

        # Format certificates
        certs_data = [
            {
                'id': c.id,
                'title': c.title,
                'description': c.description,
                'issued_date': str(c.issued_date)
            } for c in certs
        ]

        if not certs_data:
            certs_data = [
                {
                    'id': 1,
                    'title': 'Super Reader Certificate',
                    'description': f'Awarded to {child.name} for completing 10 reading modules with excellence!',
                    'issued_date': '2026-07-10'
                },
                {
                    'id': 2,
                    'title': 'Vocabulary Master Certificate',
                    'description': f'Recognizing {child.name} for mastering Grade {child.grade_level[-1] if child.grade_level else "2"} Hindi and English vocabulary.',
                    'issued_date': '2026-07-01'
                }
            ]

        # Format achievements
        achievements_data = [
            {
                'id': a.id,
                'code': a.achievement.code,
                'name': a.achievement.name,
                'emoji': a.achievement.emoji,
                'description': a.achievement.description,
                'earned_at': str(a.earned_at.date())
            } for a in achievements
        ]

        if not achievements_data:
            achievements_data = [
                {'id': 1, 'code': 'first_story', 'name': 'First Step', 'emoji': '🌟', 'description': 'Completed first story', 'earned_at': '2026-06-15'},
                {'id': 2, 'code': 'vocab_hero', 'name': 'Vocab Hero', 'emoji': '📚', 'description': 'Learned 50 new words', 'earned_at': '2026-07-04'},
                {'id': 3, 'code': 'quiz_ace', 'name': 'Quiz Ace', 'emoji': '🏆', 'description': 'Scored 100% on a quiz', 'earned_at': '2026-07-12'},
            ]

        # Format quiz attempts
        quizzes_data = [
            {
                'id': q.id,
                'quiz_title': q.quiz.title,
                'story_title': q.quiz.story.title_en if q.quiz and q.quiz.story else 'Story Quiz',
                'score': q.score,
                'total': q.total_questions,
                'percentage': q.percentage,
                'date': str(q.attempted_at.date())
            } for q in quizzes
        ]

        if not quizzes_data:
            quizzes_data = [
                {'id': 1, 'quiz_title': 'Acorn Adventure Quiz', 'story_title': 'The Brave Little Acorn', 'score': 5, 'total': 5, 'percentage': 100.0, 'date': '2026-07-15'},
                {'id': 2, 'quiz_title': 'Coral Reef Quiz', 'story_title': 'Ocean Friends', 'score': 4, 'total': 5, 'percentage': 80.0, 'date': '2026-07-14'},
                {'id': 3, 'quiz_title': 'Golden Tree Quiz', 'story_title': 'Leo & Golden Tree', 'score': 4, 'total': 5, 'percentage': 80.0, 'date': '2026-07-10'},
            ]

        return Response({
            'id': child.id,
            'name': child.name,
            'age': child.age,
            'grade': child.grade_level,
            'reading_level': child.reading_level,
            'learning_goals': child.learning_goals or 'Improve Hindi vocabulary and reading comprehension consistency.',
            'interests': child.interests or 'Animals, Space, Magic',
            'avatar': child.avatar or '🦁',
            'parent_name': child.parent.username if child.parent else 'Parent',
            'parent_email': child.parent.email if child.parent else 'parent@example.com',
            'stats': {
                'total_stories_read': len(reading_logs_data),
                'total_reading_minutes': total_read_mins,
                'total_reading_hours': round(total_read_mins / 60, 1),
                'quiz_average': round(avg_quiz, 1),
                'certificates_earned': len(certs_data),
                'badges_earned': len(achievements_data),
            },
            'reading_logs': reading_logs_data,
            'quizzes': quizzes_data,
            'certificates': certs_data,
            'achievements': achievements_data,
            'lesson_submissions': [
                {
                    'lesson_title': s.lesson.title,
                    'status': s.status,
                    'score': s.score,
                    'completion': s.completion_percentage
                } for s in submissions
            ]
        })

    @action(detail=True, methods=['post'])
    def issue_certificate(self, request, pk=None):
        from .models import Certificate
        child = self.get_object()
        title = request.data.get('title', 'Star Reader Certificate')
        description = request.data.get('description', f'Awarded to {child.name} for outstanding reading dedication.')

        cert = Certificate.objects.create(
            child=child,
            title=title,
            description=description,
            issued_date=timezone.now().date()
        )

        return Response({
            'status': 'success',
            'message': 'Certificate issued successfully',
            'certificate': {
                'id': cert.id,
                'title': cert.title,
                'description': cert.description,
                'issued_date': str(cert.issued_date)
            }
        })



class TeacherSettingsView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher_user = request.user if request.user.is_authenticated and request.user.role == User.Role.TEACHER else User.objects.filter(role=User.Role.TEACHER).first()
        if not teacher_user:
            teacher_user = User.objects.first()

        profile, _ = TeacherProfile.objects.get_or_create(
            user=teacher_user,
            defaults={
                'school_name': 'Oakridge Elementary School',
                'grade_level': 'Grade 2 & Grade 3',
                'subject': 'Primary Reading & Language Arts',
                'bio': 'Passionate elementary teacher focusing on reading comprehension, dual-language skills, and imaginative storytelling.',
                'avatar': 'MR',
                'email_notifications': True,
                'theme_preference': 'light'
            }
        )

        return Response({
            'full_name': f"{teacher_user.first_name} {teacher_user.last_name}".strip() or "Ms. Maria Rivera",
            'email': teacher_user.email or "m.rivera@oakridge.edu",
            'school_name': profile.school_name,
            'grade_level': profile.grade_level,
            'subject': profile.subject,
            'bio': profile.bio,
            'avatar': profile.avatar,
            'email_notifications': profile.email_notifications,
            'weekly_reports': True,
            'theme_preference': profile.theme_preference,
        })

    def put(self, request):
        teacher_user = request.user if request.user.is_authenticated and request.user.role == User.Role.TEACHER else User.objects.filter(role=User.Role.TEACHER).first()
        if not teacher_user:
            teacher_user = User.objects.first()

        profile, _ = TeacherProfile.objects.get_or_create(user=teacher_user)
        
        data = request.data
        if 'school_name' in data:
            profile.school_name = data['school_name']
        if 'grade_level' in data:
            profile.grade_level = data['grade_level']
        if 'subject' in data:
            profile.subject = data['subject']
        if 'bio' in data:
            profile.bio = data['bio']
        if 'email_notifications' in data:
            profile.email_notifications = bool(data['email_notifications'])
        if 'theme_preference' in data:
            profile.theme_preference = data['theme_preference']
        if 'avatar' in data:
            profile.avatar = data['avatar']
        
        profile.save()

        if 'email' in data and teacher_user:
            teacher_user.email = data['email']
            teacher_user.save()

        return Response({'status': 'success', 'message': 'Teacher settings updated successfully'})
