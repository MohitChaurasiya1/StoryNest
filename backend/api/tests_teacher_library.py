from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import User, Story, Lesson, Quiz, QuizQuestion

class TeacherLibraryTests(APITestCase):
    def setUp(self):
        # Create Teacher
        self.teacher = User.objects.create_user(
            username='libraryteacher',
            password='password123',
            role=User.Role.TEACHER
        )
        # Create Other Teacher
        self.other_teacher = User.objects.create_user(
            username='otherteacher',
            password='password123',
            role=User.Role.TEACHER
        )

        # Create Admin
        self.admin = User.objects.create_user(
            username='adminuser',
            password='password123',
            role=User.Role.ADMIN
        )

        # Create Stories
        self.system_story = Story.objects.create(
            title_en="System Story",
            parent=None,
            grade="Grade 3"
        )
        self.my_story = Story.objects.create(
            title_en="My Story",
            parent=self.teacher,
            grade="Grade 4"
        )
        self.other_story = Story.objects.create(
            title_en="Other Story",
            parent=self.other_teacher,
            grade="Grade 3"
        )

        # Create Lessons
        self.system_lesson = Lesson.objects.create(
            title="System Lesson",
            teacher=self.admin,
            grade="Grade 3"
        )
        self.my_lesson = Lesson.objects.create(
            title="My Lesson",
            teacher=self.teacher,
            grade="Grade 4"
        )
        self.other_lesson = Lesson.objects.create(
            title="Other Lesson",
            teacher=self.other_teacher,
            grade="Grade 3"
        )

        # Create Quizzes
        self.system_quiz = Quiz.objects.create(
            title="System Quiz",
            story=self.system_story
        )
        self.my_quiz = Quiz.objects.create(
            title="My Quiz",
            story=self.my_story
        )
        self.other_quiz = Quiz.objects.create(
            title="Other Quiz",
            story=self.other_story
        )

    def test_unauthenticated_access(self):
        url = reverse('teacher-library-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_library_list_visibility(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('teacher-library-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        results = response.data['results']
        # Teacher should see system content and their own content, but NOT other_teacher's content
        # Stories: system_story, my_story (2)
        # Lessons: system_lesson, my_lesson (2)
        # Quizzes: system_quiz, my_quiz (2)
        # Total = 6
        self.assertEqual(len(results), 6)
        titles = [r['title'] for r in results]
        self.assertIn("System Story", titles)
        self.assertIn("My Story", titles)
        self.assertIn("System Lesson", titles)
        self.assertIn("My Lesson", titles)
        self.assertIn("System Quiz", titles)
        self.assertIn("My Quiz", titles)
        self.assertNotIn("Other Story", titles)
        self.assertNotIn("Other Lesson", titles)
        self.assertNotIn("Other Quiz", titles)

    def test_library_list_type_filter(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('teacher-library-list') + "?type=lesson"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        results = response.data['results']
        self.assertEqual(len(results), 2)
        self.assertTrue(all(r['type'] == 'lesson' for r in results))

    def test_library_list_search_filter(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('teacher-library-list') + "?search=My"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        results = response.data['results']
        self.assertEqual(len(results), 3) # My Story, My Lesson, My Quiz
        titles = [r['title'] for r in results]
        self.assertTrue(all("My" in t for t in titles))

    def test_library_list_my_content_filter(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('teacher-library-list') + "?created_by_me=true"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        results = response.data['results']
        self.assertEqual(len(results), 3) # My Story, My Lesson, My Quiz
        titles = [r['title'] for r in results]
        self.assertIn("My Story", titles)
        self.assertIn("My Lesson", titles)
        self.assertIn("My Quiz", titles)

    def test_preview_story_authorized(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('teacher-library-preview', args=['story', self.my_story.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title_en'], "My Story")

    def test_preview_story_unauthorized(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('teacher-library-preview', args=['story', self.other_story.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Unauthorized", response.data['error']['message'])
