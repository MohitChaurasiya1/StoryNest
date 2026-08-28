from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from api.models import (
    User, TeacherClass, Story, ClassAssignment, ChildProfile, ClassStudent, ClassAssignmentStudent
)
from api.services.teacher_assignment_service import TeacherAssignmentService

class TeacherAssignmentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher1 = User.objects.create_user(username='teacher1', password='password123', role=User.Role.TEACHER)
        self.teacher2 = User.objects.create_user(username='teacher2', password='password123', role=User.Role.TEACHER)
        self.client.force_authenticate(user=self.teacher1)

        # Classroom
        self.classroom = TeacherClass.objects.create(teacher=self.teacher1, name='Class 5-A')
        self.story = Story.objects.create(title_en='The Iron Man', child_name='Aarav')

        # Students
        self.parent = User.objects.create_user(username='parent1', password='password123', role=User.Role.PARENT)
        self.child_aarav = ChildProfile.objects.create(parent=self.parent, name='Aarav Sharma')
        self.child_riya = ChildProfile.objects.create(parent=self.parent, name='Riya Gupta')
        self.child_kabir = ChildProfile.objects.create(parent=self.parent, name='Kabir Patel')

        ClassStudent.objects.create(classroom=self.classroom, child=self.child_aarav, status='active')
        ClassStudent.objects.create(classroom=self.classroom, child=self.child_riya, status='active')
        ClassStudent.objects.create(classroom=self.classroom, child=self.child_kabir, status='active')

    def test_create_assignment_entire_classroom(self):
        """Creating an assignment for entire classroom assigns all active students."""
        url = reverse('teacher_assignments_list_create')
        data = {
            'classroom_id': self.classroom.id,
            'title': 'Read: The Iron Man',
            'content_type': 'story',
            'content_id': self.story.id,
            'target_type': 'classroom',
            'due_date': (timezone.localdate() + timedelta(days=5)).isoformat()
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ClassAssignment.objects.count(), 1)
        
        assignment = ClassAssignment.objects.first()
        self.assertEqual(assignment.status, 'active')
        self.assertEqual(assignment.target_all_students, True)
        
        # Verify 3 recipients created
        recipients = ClassAssignmentStudent.objects.filter(assignment=assignment)
        self.assertEqual(recipients.count(), 3)
        self.assertEqual(response.data['stats']['assigned'], 3)
        self.assertEqual(response.data['stats']['completed'], 0)
        self.assertEqual(response.data['stats']['is_active'], True)

    def test_create_assignment_selected_students(self):
        """Creating an assignment for selected students assigns only those students."""
        url = reverse('teacher_assignments_list_create')
        data = {
            'classroom_id': self.classroom.id,
            'title': 'Targeted Reading',
            'content_type': 'story',
            'content_id': self.story.id,
            'target_type': 'student',
            'student_ids': [self.child_aarav.id, self.child_riya.id],
            'due_date': (timezone.localdate() + timedelta(days=3)).isoformat()
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        
        assignment = ClassAssignment.objects.get(id=response.data['id'])
        self.assertEqual(assignment.target_all_students, False)
        
        recipients = ClassAssignmentStudent.objects.filter(assignment=assignment)
        self.assertEqual(recipients.count(), 2)
        recipient_child_ids = set(recipients.values_list('child_id', flat=True))
        self.assertEqual(recipient_child_ids, {self.child_aarav.id, self.child_riya.id})

    def test_active_vs_previous_grouping_and_stats(self):
        """Verify active vs previous assignment filtering and progress calculation."""
        now = timezone.localdate()
        
        # 1. Active assignment due in 5 days
        active_asgn = ClassAssignment.objects.create(
            teacher=self.teacher1,
            classroom=self.classroom,
            title='Active Story Task',
            assignment_type='story',
            story=self.story,
            due_date=now + timedelta(days=5),
            status='active'
        )
        ClassAssignmentStudent.objects.create(assignment=active_asgn, child=self.child_aarav, status='completed', score=100)
        ClassAssignmentStudent.objects.create(assignment=active_asgn, child=self.child_riya, status='in_progress')
        ClassAssignmentStudent.objects.create(assignment=active_asgn, child=self.child_kabir, status='assigned')

        # 2. Previous assignment overdue
        past_asgn = ClassAssignment.objects.create(
            teacher=self.teacher1,
            classroom=self.classroom,
            title='Past Story Task',
            assignment_type='story',
            story=self.story,
            due_date=now - timedelta(days=2),
            status='active'
        )
        ClassAssignmentStudent.objects.create(assignment=past_asgn, child=self.child_aarav, status='completed', score=95)
        ClassAssignmentStudent.objects.create(assignment=past_asgn, child=self.child_riya, status='assigned')

        # Query all assignments
        url = reverse('teacher_assignments_list_create')
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        results = res.data.get('results', res.data)
        self.assertEqual(len(results), 2)

        active_data = next(a for a in results if a['id'] == active_asgn.id)
        self.assertEqual(active_data['stats']['assigned'], 3)
        self.assertEqual(active_data['stats']['completed'], 1)
        self.assertEqual(active_data['stats']['pending'], 2)
        self.assertEqual(active_data['stats']['in_progress'], 1)
        self.assertEqual(active_data['stats']['completion_percentage'], 33)
        self.assertEqual(active_data['stats']['is_active'], True)

        past_data = next(a for a in results if a['id'] == past_asgn.id)
        self.assertEqual(past_data['stats']['assigned'], 2)
        self.assertEqual(past_data['stats']['completed'], 1)
        self.assertEqual(past_data['stats']['overdue'], 1)
        self.assertEqual(past_data['stats']['is_active'], False)

    def test_student_assignment_breakdown_and_overdue_logic(self):
        """
        Verify student assignment view:
        - Aarav completed assignment -> status is 'completed'.
        - Riya has past due assignment -> status is 'overdue'.
        """
        now = timezone.localdate()

        asgn_past = ClassAssignment.objects.create(
            teacher=self.teacher1,
            classroom=self.classroom,
            title='The Brave Rabbit',
            assignment_type='story',
            story=self.story,
            due_date=now - timedelta(days=3),
            status='active'
        )
        # Aarav completed before/on due date
        ClassAssignmentStudent.objects.create(
            assignment=asgn_past,
            child=self.child_aarav,
            status='completed',
            completed_at=timezone.now(),
            score=100
        )
        # Riya did not complete -> Overdue
        ClassAssignmentStudent.objects.create(
            assignment=asgn_past,
            child=self.child_riya,
            status='assigned'
        )

        # Test Aarav's assignments
        url_aarav = reverse('teacher_student_assignments', args=[self.classroom.id, self.child_aarav.id])
        res_aarav = self.client.get(url_aarav)
        self.assertEqual(res_aarav.status_code, 200)
        self.assertEqual(len(res_aarav.data['completed']), 1)
        self.assertEqual(res_aarav.data['completed'][0]['status'], 'completed')
        self.assertEqual(res_aarav.data['stats']['overdue'], 0)

        # Test Riya's assignments
        url_riya = reverse('teacher_student_assignments', args=[self.classroom.id, self.child_riya.id])
        res_riya = self.client.get(url_riya)
        self.assertEqual(res_riya.status_code, 200)
        self.assertEqual(len(res_riya.data['overdue']), 1)
        self.assertEqual(res_riya.data['overdue'][0]['status'], 'overdue')
        self.assertEqual(res_riya.data['stats']['overdue'], 1)

    def test_teacher_cannot_create_or_view_other_teacher_classroom_assignment(self):
        """Teacher 2 cannot create assignments for Teacher 1's classroom."""
        self.client.force_authenticate(user=self.teacher2)
        url = reverse('teacher_assignments_list_create')
        data = {
            'classroom_id': self.classroom.id,
            'title': 'Hacked assignment',
            'content_type': 'story',
            'content_id': self.story.id,
            'target_type': 'classroom'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Classroom not found or access denied', str(response.data))

    def test_recipient_list_filtering(self):
        """Verify assignment recipient list filtering by status."""
        asgn = ClassAssignment.objects.create(
            teacher=self.teacher1,
            classroom=self.classroom,
            title='Quiz 1',
            assignment_type='story',
            story=self.story,
            due_date=timezone.localdate() + timedelta(days=2),
            status='active'
        )
        ClassAssignmentStudent.objects.create(assignment=asgn, child=self.child_aarav, status='completed')
        ClassAssignmentStudent.objects.create(assignment=asgn, child=self.child_riya, status='in_progress')
        ClassAssignmentStudent.objects.create(assignment=asgn, child=self.child_kabir, status='assigned')

        # Filter completed
        url = reverse('teacher_assignment_recipients', args=[asgn.id]) + '?status=completed'
        res = self.client.get(url)
        self.assertEqual(res.status_code, 200)
        results = res.data.get('results', res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'Aarav Sharma')
