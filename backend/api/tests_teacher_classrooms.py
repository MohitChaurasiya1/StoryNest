from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from api.models import User, TeacherProfile, TeacherClass, ClassStudent, ChildProfile

class TeacherClassroomAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create Teacher 1
        self.teacher1 = User.objects.create_user(username='t1', email='t1@test.com', password='pw', role=User.Role.TEACHER)
        TeacherProfile.objects.create(user=self.teacher1)
        
        # Create Teacher 2
        self.teacher2 = User.objects.create_user(username='t2', email='t2@test.com', password='pw', role=User.Role.TEACHER)
        
        # Create Parent
        self.parent = User.objects.create_user(username='p1', email='p1@test.com', password='pw', role=User.Role.PARENT)
        
        # Create Children
        self.child1 = ChildProfile.objects.create(parent=self.parent, name='C1', age=8)
        self.child2 = ChildProfile.objects.create(parent=self.parent, name='C2', age=9)
        self.child3 = ChildProfile.objects.create(parent=self.parent, name='C3', age=10)
        
        # Create a classroom for Teacher 1
        self.classroom1 = TeacherClass.objects.create(
            teacher=self.teacher1,
            name='Class A',
            academic_year='2026'
        )

    def test_list_classrooms_unauthorized(self):
        url = reverse('teacher_classrooms_list_create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Parent access should fail
        self.client.force_authenticate(user=self.parent)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_classrooms_teacher(self):
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_classrooms_list_create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Class A')
        
    def test_create_classroom(self):
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_classrooms_list_create')
        
        data = {
            "name": "Class B",
            "grade": "Grade 2",
            "academic_year": "2026"
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TeacherClass.objects.filter(teacher=self.teacher1).count(), 2)
        
    def test_create_duplicate_classroom(self):
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_classrooms_list_create')
        data = {"name": "Class A", "academic_year": "2026"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_get_classroom_detail(self):
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_classroom_detail', args=[self.classroom1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Class A')
        self.assertIn('stats', response.data)
        
    def test_get_classroom_detail_wrong_teacher(self):
        self.client.force_authenticate(user=self.teacher2)
        url = reverse('teacher_classroom_detail', args=[self.classroom1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
    def test_add_students(self):
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_classroom_students', args=[self.classroom1.id])
        
        data = {"student_ids": [self.child1.id, self.child2.id]}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ClassStudent.objects.filter(classroom=self.classroom1, status='active').count(), 2)

    def test_add_student_invalid(self):
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_classroom_students', args=[self.classroom1.id])
        
        data = {"student_ids": [9999]}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_remove_student(self):
        # Setup student in classroom
        ClassStudent.objects.create(classroom=self.classroom1, child=self.child1, status='active')
        
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_classroom_student_detail', args=[self.classroom1.id, self.child1.id])
        
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        membership = ClassStudent.objects.get(classroom=self.classroom1, child=self.child1)
        self.assertEqual(membership.status, 'removed')
        # Ensure child profile is intact
        self.assertTrue(ChildProfile.objects.filter(id=self.child1.id).exists())
