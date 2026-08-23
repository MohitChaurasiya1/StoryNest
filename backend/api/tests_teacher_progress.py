from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from api.models import User, TeacherClass, ChildProfile, ClassStudent, ReadingLog, ReadingProgress, Quiz, QuizAttempt

class TeacherProgressTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Teachers
        self.teacher1 = User.objects.create_user(username='teacher_p1', password='password123', role=User.Role.TEACHER)
        self.teacher2 = User.objects.create_user(username='teacher_p2', password='password123', role=User.Role.TEACHER)

        # Classroom
        self.classroom = TeacherClass.objects.create(teacher=self.teacher1, name='Class 5A')

        # Students
        self.parent = User.objects.create_user(username='parent_p1', password='password123', role=User.Role.PARENT)
        self.child1 = ChildProfile.objects.create(parent=self.parent, name='Aarav Sharma')
        self.child2 = ChildProfile.objects.create(parent=self.parent, name='Riya Gupta')

        ClassStudent.objects.create(classroom=self.classroom, child=self.child1, status='active')
        ClassStudent.objects.create(classroom=self.classroom, child=self.child2, status='active')

    def test_overview_unauthorized_user(self):
        url = reverse('teacher_progress_overview')
        # Unauthenticated
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

        # Parent Role
        self.client.force_authenticate(user=self.parent)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_overview_success(self):
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_progress_overview')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_students'], 2)
        self.assertIn('average_progress', response.data)
        self.assertIn('quiz_average', response.data)

    def test_student_detail_permission_denied_for_other_teacher(self):
        self.client.force_authenticate(user=self.teacher2)
        url = reverse('teacher_progress_student_detail', args=[self.child1.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 403)

    def test_student_detail_success(self):
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_progress_student_detail', args=[self.child1.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['student']['name'], 'Aarav Sharma')

    def test_export_csv(self):
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_progress_export')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/csv')
