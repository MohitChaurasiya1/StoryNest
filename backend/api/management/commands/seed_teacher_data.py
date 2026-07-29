from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import (
    User, ChildProfile, TeacherProfile, TeacherClass, ClassStudent,
    Lesson, LessonSubmission, TeacherMessage, Story, ReadingLog, QuizAttempt, Quiz
)


class Command(BaseCommand):
    help = 'Seed initial teacher data (classes, students, lessons, submissions, inbox messages)'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Teacher Module Data...')

        # 1. Teacher User
        teacher_user, created = User.objects.get_or_create(
            username='teacher_rivera',
            defaults={
                'email': 'maria.rivera@oakridge.edu',
                'first_name': 'Maria',
                'last_name': 'Rivera',
                'role': User.Role.TEACHER,
            }
        )
        if created:
            teacher_user.set_password('teacher123')
            teacher_user.save()
            self.stdout.write('Created teacher user: teacher_rivera')

        # 2. Teacher Profile
        profile, _ = TeacherProfile.objects.get_or_create(
            user=teacher_user,
            defaults={
                'school_name': 'Oakridge Elementary School',
                'grade_level': 'Grade 2 & Grade 3',
                'subject': 'Primary Reading & Literature',
                'bio': 'Passionate 2nd grade lead teacher specializing in story-driven language arts.',
                'avatar': 'MR',
                'email_notifications': True,
                'theme_preference': 'light'
            }
        )

        # 3. Teacher Class
        t_class, _ = TeacherClass.objects.get_or_create(
            teacher=teacher_user,
            name='Grade 2 - Owls',
            defaults={
                'grade_level': 'Grade 2',
                'academic_year': '2025-2026'
            }
        )

        # 4. Default Parent User for Students
        parent_user, _ = User.objects.get_or_create(
            username='parent_demo',
            defaults={
                'email': 'parent@example.com',
                'role': User.Role.PARENT,
            }
        )

        # 5. Students
        sample_students = [
            {'name': 'Leo Martinez', 'age': 7, 'grade_level': 'Grade 2', 'reading_level': 'Advanced', 'avatar': '🦁'},
            {'name': 'Emma Chen', 'age': 7, 'grade_level': 'Grade 2', 'reading_level': 'Intermediate', 'avatar': '🐰'},
            {'name': 'Aisha Patel', 'age': 8, 'grade_level': 'Grade 3', 'reading_level': 'Beginner', 'avatar': '🐯'},
            {'name': 'Noah Williams', 'age': 7, 'grade_level': 'Grade 2', 'reading_level': 'Advanced', 'avatar': '🐻'},
            {'name': 'Sofia Rodriguez', 'age': 7, 'grade_level': 'Grade 2', 'reading_level': 'Beginner', 'avatar': '🦊'},
            {'name': 'Liam O\'Brien', 'age': 8, 'grade_level': 'Grade 3', 'reading_level': 'Intermediate', 'avatar': '🐼'},
        ]

        child_profiles = []
        for s in sample_students:
            child, _ = ChildProfile.objects.get_or_create(
                parent=parent_user,
                name=s['name'],
                defaults={
                    'age': s['age'],
                    'grade_level': s['grade_level'],
                    'reading_level': s['reading_level'],
                    'avatar': s['avatar']
                }
            )
            child_profiles.append(child)
            ClassStudent.objects.get_or_create(classroom=t_class, child=child)

        # 6. Sample Lessons
        lessons_data = [
            {
                'title': 'The Brave Little Acorn',
                'description': 'Read chapter 1 to 3 and answer comprehension questions about courage.',
                'grade': 'Grade 2',
                'status': 'active',
                'due_date': 'Due Today',
                'total_students': len(child_profiles)
            },
            {
                'title': 'Ocean Friends: A Coral Reef Story',
                'description': 'Explore marine life vocabulary and complete the quiz.',
                'grade': 'Grade 3',
                'status': 'active',
                'due_date': 'Due Tomorrow',
                'total_students': len(child_profiles)
            },
            {
                'title': 'Leo and the Golden Tree',
                'description': 'Fable story focusing on generosity and Hindi vocabulary.',
                'grade': 'Grade 2',
                'status': 'upcoming',
                'due_date': 'Jul 20',
                'total_students': len(child_profiles)
            },
            {
                'title': 'The Wind\'s Secret Song',
                'description': 'Rhythmic bedtime story for reading fluency.',
                'grade': 'Grade 1',
                'status': 'completed',
                'due_date': 'Completed Jul 12',
                'total_students': len(child_profiles)
            },
            {
                'title': 'Adventures in Starlight Meadow',
                'description': 'Space and star exploration story with audio narration.',
                'grade': 'Grade 2',
                'status': 'completed',
                'due_date': 'Completed Jul 10',
                'total_students': len(child_profiles)
            },
        ]

        for ld in lessons_data:
            lesson, _ = Lesson.objects.get_or_create(
                teacher=teacher_user,
                title=ld['title'],
                defaults={
                    'classroom': t_class,
                    'description': ld['description'],
                    'grade': ld['grade'],
                    'status': ld['status'],
                    'due_date': ld['due_date'],
                    'total_students': ld['total_students']
                }
            )

            # Submissions
            for idx, child in enumerate(child_profiles):
                if ld['status'] == 'completed':
                    sub_status = 'completed'
                    pct = 100
                    score = 90 - (idx * 3)
                elif ld['status'] == 'active':
                    if idx < 4:
                        sub_status = 'completed'
                        pct = 100
                        score = 85
                    elif idx == 4:
                        sub_status = 'in_progress'
                        pct = 40
                        score = 0
                    else:
                        sub_status = 'assigned'
                        pct = 0
                        score = 0
                else:
                    sub_status = 'assigned'
                    pct = 0
                    score = 0

                LessonSubmission.objects.get_or_create(
                    lesson=lesson,
                    child=child,
                    defaults={
                        'status': sub_status,
                        'completion_percentage': pct,
                        'score': score,
                        'reading_time_minutes': 15 if pct > 0 else 0,
                        'completed_at': timezone.now() if sub_status == 'completed' else None
                    }
                )

        # 7. Sample Messages for Inbox
        sample_messages = [
            {
                'sender_name': 'Mrs. Martinez (Leo\'s Parent)',
                'subject': 'Question about Leo\'s reading level progression',
                'content': 'Hi Ms. Rivera, Leo loved "The Brave Little Acorn"! Should we start assigning Grade 3 books at home?',
                'message_type': 'parent',
                'is_read': False
            },
            {
                'sender_name': 'System Alert',
                'subject': 'Weekly Comprehension Summary Ready',
                'content': 'Class performance summary for Grade 2 - Owls is ready. Average comprehension score is 84.5%.',
                'message_type': 'system',
                'is_read': False
            },
            {
                'sender_name': 'Mr. Chen (Emma\'s Parent)',
                'subject': 'Extension request for Coral Reef story',
                'content': 'Hello! Emma had a doctor appointment yesterday. Can she finish the quiz by tomorrow evening?',
                'message_type': 'parent',
                'is_read': True
            },
            {
                'sender_name': 'Principal Harris',
                'subject': 'Upcoming StoryNest Reading Competition',
                'content': 'Dear Teachers, please review the instructions for the inter-class reading challenge starting next week.',
                'message_type': 'admin',
                'is_read': True
            },
            {
                'sender_name': 'Sofia Rodriguez',
                'subject': 'I finished reading chapter 2!',
                'content': 'Ms. Rivera! I read the story about the golden tree twice today with my mom!',
                'message_type': 'student',
                'is_read': False
            }
        ]

        for msg in sample_messages:
            TeacherMessage.objects.get_or_create(
                subject=msg['subject'],
                defaults={
                    'recipient': teacher_user,
                    'sender_name': msg['sender_name'],
                    'content': msg['content'],
                    'message_type': msg['message_type'],
                    'is_read': msg['is_read']
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Teacher Module Data!'))
