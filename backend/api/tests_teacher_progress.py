from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from api.models import (
    User, TeacherClass, ChildProfile, ClassStudent, ReadingLog,
    ReadingProgress, Quiz, QuizAttempt, ClassAssignment, ClassAssignmentStudent
)
from api.services.teacher_progress_service import TeacherProgressService

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
        self.child_aarav = ChildProfile.objects.create(parent=self.parent, name='Aarav')
        self.child_riya = ChildProfile.objects.create(parent=self.parent, name='Riya')
        self.child_new = ChildProfile.objects.create(parent=self.parent, name='New Learner')

        ClassStudent.objects.create(classroom=self.classroom, child=self.child_aarav, status='active')
        ClassStudent.objects.create(classroom=self.classroom, child=self.child_riya, status='active')
        ClassStudent.objects.create(classroom=self.classroom, child=self.child_new, status='active')

    def test_overview_unauthorized_user(self):
        url = reverse('teacher_progress_overview')
        # Unauthenticated
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

        # Parent Role
        self.client.force_authenticate(user=self.parent)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_student_aarav_completed_assignment_is_on_track_not_at_risk(self):
        """
        Test User Requirement 22:
        Student: Aarav
        Assignment: 1 assigned, 1 completed
        Expected: Assignment Completion = 100%, Progress = 100%, Status = on_track (NOT At Risk).
        """
        asgn = ClassAssignment.objects.create(
            teacher=self.teacher1,
            classroom=self.classroom,
            title='Read Story 1',
            assignment_type='story'
        )
        ClassAssignmentStudent.objects.create(
            assignment=asgn,
            child=self.child_aarav,
            status='completed',
            score=100
        )

        metrics = TeacherProgressService.calculate_student_metrics(self.child_aarav, self.teacher1)
        self.assertEqual(metrics['assignment_completion'], 100)
        self.assertEqual(metrics['overall_progress'], 100)
        self.assertEqual(metrics['status'], 'on_track')
        self.assertEqual(len(metrics['reasons']), 0)

        # Verify via API endpoint
        self.client.force_authenticate(user=self.teacher1)
        res = self.client.get(reverse('teacher_progress_student_detail', args=[self.child_aarav.id]))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['overview']['progress'], 100)
        self.assertEqual(res.data['overview']['assignment_completion'], 100)
        self.assertEqual(res.data['risk']['status'], 'on_track')

    def test_student_riya_at_risk_with_real_reasons(self):
        """
        Test User Requirement 22:
        Student: Riya
        Assignments: 5 assigned, 1 completed, 4 overdue
        Reading: No activity for 8 days
        Quiz average: 45%
        Expected: Assignment Completion = 20%, Status = at_risk with concrete reasons.
        """
        now = timezone.now()
        past_date = now - timedelta(days=2)

        # 1. 1 completed assignment
        asgn1 = ClassAssignment.objects.create(
            teacher=self.teacher1,
            classroom=self.classroom,
            title='Task 1',
            assignment_type='story',
            due_date=past_date
        )
        ClassAssignmentStudent.objects.create(
            assignment=asgn1,
            child=self.child_riya,
            status='completed',
            score=90
        )

        # 2. 4 overdue assignments
        for i in range(2, 6):
            asgn = ClassAssignment.objects.create(
                teacher=self.teacher1,
                classroom=self.classroom,
                title=f'Task {i}',
                assignment_type='story',
                due_date=past_date
            )
            ClassAssignmentStudent.objects.create(
                assignment=asgn,
                child=self.child_riya,
                status='assigned'
            )

        # 3. Reading log from 8 days ago
        ReadingLog.objects.create(
            child=self.child_riya,
            story_title='Old Story',
            reading_time_minutes=15,
            pages_read=5,
            completed=True,
            read_date=(now - timedelta(days=8)).date()
        )

        # 4. Low quiz attempt (45%)
        from api.models import Story
        story = Story.objects.create(title_en='Grammar Adventures', child_name='Riya')
        quiz = Quiz.objects.create(story=story, title='Grammar Quiz 1')
        QuizAttempt.objects.create(
            child=self.child_riya,
            quiz=quiz,
            score=9,
            total_questions=20,
            percentage=45.0
        )

        metrics = TeacherProgressService.calculate_student_metrics(self.child_riya, self.teacher1)
        self.assertEqual(metrics['assignment_completion'], 20)
        self.assertEqual(metrics['status'], 'at_risk')
        self.assertGreater(metrics['risk_score'], 50)
        self.assertTrue(any('overdue' in r for r in metrics['reasons']))
        self.assertTrue(any('reading activity' in r for r in metrics['reasons']))
        self.assertTrue(any('Quiz average' in r for r in metrics['reasons']))

        # Verify via student list API
        self.client.force_authenticate(user=self.teacher1)
        res = self.client.get(reverse('teacher_progress_student_list'))
        self.assertEqual(res.status_code, 200)
        results = res.data.get('results', res.data)
        riya_data = next(s for s in results if s['id'] == self.child_riya.id)
        self.assertEqual(riya_data['status'], 'at_risk')
        self.assertEqual(riya_data['assignment_completion'], 20)
        self.assertGreater(len(riya_data['reasons']), 0)

    def test_new_student_without_data_is_not_punished_as_at_risk(self):
        """
        Test User Requirement 8:
        Brand new student with no assignments or quiz attempts should NOT be marked At Risk.
        """
        metrics = TeacherProgressService.calculate_student_metrics(self.child_new, self.teacher1)
        self.assertIsNone(metrics['assignment_completion'])
        self.assertIsNone(metrics['quiz_average'])
        self.assertIsNone(metrics['overall_progress'])
        self.assertEqual(metrics['status'], 'on_track')
        self.assertEqual(len(metrics['reasons']), 0)

    def test_student_detail_permission_denied_for_other_teacher(self):
        self.client.force_authenticate(user=self.teacher2)
        url = reverse('teacher_progress_student_detail', args=[self.child_aarav.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_export_csv(self):
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_progress_export')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertIn('Aarav', response.content.decode())
