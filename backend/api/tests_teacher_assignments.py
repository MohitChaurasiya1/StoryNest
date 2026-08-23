
from django.test import TestCase
from rest_framework.test import APIClient
from api.models import User, TeacherClass, Story, ClassAssignment, ChildProfile, ClassStudent, ClassAssignmentStudent
from django.urls import reverse

class TeacherAssignmentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = User.objects.create_user(username='teacher1', password='password123', role=User.Role.TEACHER)
        self.client.force_authenticate(user=self.teacher)

        self.classroom = TeacherClass.objects.create(teacher=self.teacher, name='Class 1')
        self.story = Story.objects.create(title_en='Test Story', child_name='Any')
        
        # Create student
        self.parent = User.objects.create_user(username='parent1', password='password123', role=User.Role.PARENT)
        self.child = ChildProfile.objects.create(parent=self.parent, name='Child 1')
        self.enrollment = ClassStudent.objects.create(classroom=self.classroom, child=self.child, status='active')

    def test_create_assignment(self):
        url = reverse('teacher_assignments_list_create')
        data = {
            'classroom_id': self.classroom.id,
            'title': 'Read this story',
            'content_type': 'story',
            'content_id': self.story.id,
            'target_type': 'classroom'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ClassAssignment.objects.count(), 1)
        assignment = ClassAssignment.objects.first()
        self.assertEqual(assignment.status, 'draft')

    def test_publish_assignment(self):
        assignment = ClassAssignment.objects.create(
            teacher=self.teacher, classroom=self.classroom, title='Draft Assig', 
            assignment_type='story', story=self.story, status='draft', target_all_students=True
        )
        url = reverse('teacher_assignment_publish', args=[assignment.id])
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, 200)
        
        assignment.refresh_from_db()
        self.assertEqual(assignment.status, 'active')
        
        # Check if recipient created
        self.assertEqual(ClassAssignmentStudent.objects.filter(assignment=assignment).count(), 1)
