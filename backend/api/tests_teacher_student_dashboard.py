from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.models import (
    TeacherClass, ClassStudent, ChildProfile, ReadingLog, 
    Achievement, ChildAchievement, ClassAssignment, ClassAssignmentStudent
)
from api.services.teacher_classroom_service import TeacherClassroomService

User = get_user_model()

class TeacherStudentDashboardTests(APITestCase):
    def setUp(self):
        self.teacher1 = User.objects.create_user(
            username='teacher1',
            email='teacher1@school.com',
            password='password123',
            role=User.Role.TEACHER
        )
        self.teacher2 = User.objects.create_user(
            username='teacher2',
            email='teacher2@school.com',
            password='password123',
            role=User.Role.TEACHER
        )

        self.classroom1 = TeacherClass.objects.create(
            teacher=self.teacher1,
            name='Grade 2A',
            grade_level='Grade 2',
            academic_year='2026-2027'
        )

        self.classroom2 = TeacherClass.objects.create(
            teacher=self.teacher2,
            name='Grade 3B',
            grade_level='Grade 3',
            academic_year='2026-2027'
        )

        self.student1 = ChildProfile.objects.create(
            name='Leo Lion',
            age=7,
            grade_level='Grade 2',
            reading_level='Intermediate',
            avatar='🦁'
        )
        ClassStudent.objects.create(
            classroom=self.classroom1,
            child=self.student1,
            status='active'
        )

        self.student2 = ChildProfile.objects.create(
            name='Zara Zebra',
            age=8,
            grade_level='Grade 3',
            reading_level='Advanced',
            avatar='🦓'
        )
        ClassStudent.objects.create(
            classroom=self.classroom2,
            child=self.student2,
            status='active'
        )

    def test_get_student_dashboard_success(self):
        # Create reading logs for student1
        ReadingLog.objects.create(
            child=self.student1,
            story_title='The Golden Sun',
            read_date=timezone.localdate(),
            reading_time_minutes=25,
            pages_read=6,
            completed=True
        )

        data = TeacherClassroomService.get_student_dashboard(
            self.teacher1, self.classroom1.id, self.student1.id
        )

        self.assertEqual(data['child']['name'], 'Leo Lion')
        self.assertEqual(data['stats']['total_books_read'], 1)
        self.assertEqual(data['stats']['total_minutes'], 25)
        self.assertEqual(len(data['weekly_activity']), 7)
        self.assertEqual(len(data['recent_stories']), 1)
        self.assertEqual(data['recent_stories'][0]['title'], 'The Golden Sun')

    def test_cross_teacher_isolation(self):
        # Teacher 1 trying to access Teacher 2's student should fail
        with self.assertRaises(Exception):
            TeacherClassroomService.get_student_dashboard(
                self.teacher1, self.classroom2.id, self.student2.id
            )

    def test_create_and_delete_student_reading_log(self):
        log_data = {
            'story_title': 'Space Adventures',
            'read_date': str(timezone.localdate()),
            'reading_time_minutes': 30,
            'pages_read': 10,
            'completed': True,
            'rating': 5,
            'notes': 'Great reading fluency today!'
        }

        created = TeacherClassroomService.create_student_reading_log(
            self.teacher1, self.classroom1.id, self.student1.id, log_data
        )
        self.assertEqual(created['story_title'], 'Space Adventures')
        self.assertEqual(created['reading_time_minutes'], 30)

        logs = TeacherClassroomService.get_student_reading_logs(
            self.teacher1, self.classroom1.id, self.student1.id
        )
        self.assertEqual(len(logs), 1)

        # Delete log
        deleted = TeacherClassroomService.delete_student_reading_log(
            self.teacher1, self.classroom1.id, self.student1.id, created['id']
        )
        self.assertTrue(deleted)
        logs_after = TeacherClassroomService.get_student_reading_logs(
            self.teacher1, self.classroom1.id, self.student1.id
        )
        self.assertEqual(len(logs_after), 0)

    def test_assignment_completion_sync_on_reading_log(self):
        assignment = ClassAssignment.objects.create(
            teacher=self.teacher1,
            classroom=self.classroom1,
            title='The Brave Lion',
            assignment_type='story',
            due_date=timezone.localdate() + timezone.timedelta(days=7),
            target_all_students=True,
            status='active'
        )

        # Before logging, assignment is assigned
        assignments = TeacherClassroomService.get_student_assignments(
            self.teacher1, self.classroom1.id, self.student1.id
        )
        self.assertEqual(len(assignments), 1)
        self.assertEqual(assignments[0]['status'], 'assigned')

        # Log reading session for this story
        TeacherClassroomService.create_student_reading_log(
            self.teacher1, self.classroom1.id, self.student1.id, {
                'story_title': 'The Brave Lion',
                'reading_time_minutes': 25,
                'pages_read': 8,
                'completed': True,
                'rating': 5
            }
        )

        # Assignment should now be completed!
        assignments_after = TeacherClassroomService.get_student_assignments(
            self.teacher1, self.classroom1.id, self.student1.id
        )
        self.assertEqual(len(assignments_after), 1)
        self.assertEqual(assignments_after[0]['status'], 'completed')
        self.assertEqual(assignments_after[0]['score'], 100)

    def test_get_classroom_students_api(self):
        self.client.force_authenticate(user=self.teacher1)
        response = self.client.get(f'/api/teacher/classrooms/{self.classroom1.id}/students/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Leo Lion')
        self.assertIn('avatar_url', response.data['results'][0])


