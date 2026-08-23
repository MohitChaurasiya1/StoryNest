from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from api.models import (
    User, TeacherProfile, ParentProfile, ChildProfile, TeacherClass,
    ClassStudent, ClassAssignment, ClassAssignmentStudent, Quiz, QuizAttempt,
    Story, ReadingLog
)
from django.utils import timezone
from datetime import timedelta

class TeacherDashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('teacher_dashboard_v2')

        # 1. Create a Teacher User
        self.teacher_user = User.objects.create_user(
            username='teacher1', email='teacher1@test.com',
            password='password123', role=User.Role.TEACHER,
            first_name='Sarah', last_name='Smith'
        )
        TeacherProfile.objects.create(user=self.teacher_user)

        # 2. Create another Teacher User (for authorization boundary tests)
        self.teacher2_user = User.objects.create_user(
            username='teacher2', email='teacher2@test.com',
            password='password123', role=User.Role.TEACHER,
            first_name='John', last_name='Doe'
        )
        TeacherProfile.objects.create(user=self.teacher2_user)

        # 3. Create a Parent User
        self.parent_user = User.objects.create_user(
            username='parent1', email='parent1@test.com',
            password='password123', role=User.Role.PARENT
        )
        ParentProfile.objects.create(user=self.parent_user)

        # 4. Create Children
        self.child1 = ChildProfile.objects.create(parent=self.parent_user, name='Aarav')
        self.child2 = ChildProfile.objects.create(parent=self.parent_user, name='Riya')

        # 5. Create Teacher 1's Classroom
        self.classroom1 = TeacherClass.objects.create(
            teacher=self.teacher_user, name='Class 5-A', status='active'
        )
        ClassStudent.objects.create(classroom=self.classroom1, child=self.child1, status='active')

        # 6. Create Teacher 2's Classroom (should not leak to Teacher 1)
        self.classroom2 = TeacherClass.objects.create(
            teacher=self.teacher2_user, name='Class 6-B', status='active'
        )
        ClassStudent.objects.create(classroom=self.classroom2, child=self.child2, status='active')

        # 7. Create Story and Quiz
        self.story = Story.objects.create(
            parent=self.parent_user, title_en='The Moon Rabbit'
        )
        self.quiz = Quiz.objects.create(story=self.story, title='Moon Rabbit Quiz')

    def test_authentication_required(self):
        # Unauthenticated -> 401
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_parent_forbidden(self):
        # Parent -> 403
        self.client.force_authenticate(user=self.parent_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 403)

    def test_teacher_allowed_and_empty_state(self):
        # Teacher 2 has no assignments/activity yet
        self.client.force_authenticate(user=self.teacher2_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify stats
        self.assertEqual(data['summary']['classrooms'], 1)
        self.assertEqual(data['summary']['students'], 1) # Child 2
        self.assertEqual(data['summary']['pending_assignments'], 0)
        self.assertEqual(len(data['attention_items']), 0)
        self.assertEqual(len(data['upcoming_assignments']), 0)

    def test_teacher_sees_own_info_only(self):
        # Create an assignment for Teacher 1
        assignment = ClassAssignment.objects.create(
            teacher=self.teacher_user,
            classroom=self.classroom1,
            title='Homework 1',
            status='active',
            due_date=timezone.now().date() + timedelta(days=1)
        )
        ClassAssignmentStudent.objects.create(
            assignment=assignment, child=self.child1, status='assigned'
        )

        # Teacher 2 requests dashboard
        self.client.force_authenticate(user=self.teacher2_user)
        response = self.client.get(self.url)
        data = response.json()

        # Teacher 2 should NOT see Teacher 1's assignment
        self.assertEqual(data['summary']['pending_assignments'], 0)
        self.assertEqual(len(data['upcoming_assignments']), 0)

        # Teacher 1 requests dashboard
        self.client.force_authenticate(user=self.teacher_user)
        response_t1 = self.client.get(self.url)
        data_t1 = response_t1.json()

        # Teacher 1 SHOULD see the assignment
        self.assertEqual(data_t1['summary']['pending_assignments'], 1)
        self.assertEqual(len(data_t1['upcoming_assignments']), 1)
        self.assertEqual(data_t1['upcoming_assignments'][0]['title'], 'Homework 1')

    def test_attention_items_logic(self):
        # 1. Overdue Assignment (High Priority)
        assignment_overdue = ClassAssignment.objects.create(
            teacher=self.teacher_user,
            classroom=self.classroom1,
            title='Overdue Math',
            status='active',
            due_date=timezone.now().date() - timedelta(days=2) # Past due
        )
        ClassAssignmentStudent.objects.create(
            assignment=assignment_overdue, child=self.child1, status='assigned'
        )

        # 2. Low Quiz Score (Medium Priority)
        QuizAttempt.objects.create(
            quiz=self.quiz, child=self.child1,
            score=2, total_questions=5, percentage=40 # < 60%
        )

        self.client.force_authenticate(user=self.teacher_user)
        response = self.client.get(self.url)
        data = response.json()

        attention_items = data['attention_items']
        self.assertEqual(len(attention_items), 2)
        
        # Check overdue item
        overdue_item = next(item for item in attention_items if item['severity'] == 'high')
        self.assertIn('Overdue Math', overdue_item['issue'])
        self.assertEqual(overdue_item['student_name'], 'Aarav')

        # Check quiz item
        quiz_item = next(item for item in attention_items if item['severity'] == 'medium')
        self.assertIn('Scored 40.0%', quiz_item['issue'])

    def test_recent_activity_feed(self):
        # 1. Reading completion
        ReadingLog.objects.create(
            child=self.child1, story=self.story, completed=True
        )

        self.client.force_authenticate(user=self.teacher_user)
        response = self.client.get(self.url)
        data = response.json()

        activities = data['recent_activity']
        self.assertEqual(len(activities), 1)
        self.assertEqual(activities[0]['activity_type'], 'STORY_COMPLETED')
        self.assertEqual(activities[0]['related_content'], 'The Moon Rabbit')
        self.assertEqual(activities[0]['student_name'], 'Aarav')
