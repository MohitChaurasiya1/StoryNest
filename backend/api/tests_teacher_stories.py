from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from api.models import (
    User, TeacherProfile, TeacherClass, ClassStudent, 
    ChildProfile, Story, StoryPage, ClassAssignment, ClassAssignmentStudent
)

class TeacherStoryTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher1 = User.objects.create_user(
            username='ms_sarah',
            email='sarah@oakridge.edu',
            password='password123',
            role=User.Role.TEACHER
        )
        self.teacher2 = User.objects.create_user(
            username='mr_john',
            email='john@oakridge.edu',
            password='password123',
            role=User.Role.TEACHER
        )
        self.classroom1 = TeacherClass.objects.create(
            teacher=self.teacher1,
            name='Grade 3 — Section A',
            grade_level='Grade 3'
        )
        self.child1 = ChildProfile.objects.create(name='Aarav Sharma', age=8, grade_level='Grade 3')
        self.child2 = ChildProfile.objects.create(name='Riya Gupta', age=8, grade_level='Grade 3')
        ClassStudent.objects.create(classroom=self.classroom1, child=self.child1, status='active')
        ClassStudent.objects.create(classroom=self.classroom1, child=self.child2, status='active')

    def test_create_story_manual(self):
        self.client.force_authenticate(user=self.teacher1)
        url = reverse('teacher_stories_list_create')
        data = {
            "title_en": "The Brave Little Fox",
            "title_hi": "बहादुर छोटा लोमड़ी",
            "grade": "Grade 3",
            "reading_difficulty": "Intermediate",
            "genre": "Adventure",
            "moral": "Courage and kindness",
            "setting": "Enchanted Forest",
            "hero_animal": "Fox",
            "pages": [
                {
                    "page_number": 1,
                    "text_en": "Once upon a time in an enchanted forest, there lived a fox named Felix.",
                    "text_hi": "एक बार की बात है, एक जादुई जंगल में फेलिक्स नाम का एक लोमड़ी रहता था।",
                    "illustration_prompt": "Cute fox in glowing forest"
                },
                {
                    "page_number": 2,
                    "text_en": "Felix loved to explore high cliffs and meet friendly birds.",
                    "text_hi": "फेलिक्स को ऊंची चट्टानों की खोज करना पसंद था।",
                    "illustration_prompt": "Fox standing on cliff with bluebirds"
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], "The Brave Little Fox")
        self.assertEqual(len(response.data['pages']), 2)
        self.assertEqual(response.data['num_pages'], 2)

        # Check DB
        story = Story.objects.get(id=response.data['id'])
        self.assertEqual(story.parent, self.teacher1)
        self.assertEqual(story.builder_mode, 'teacher')
        self.assertEqual(story.pages.count(), 2)

    def test_get_story_detail(self):
        self.client.force_authenticate(user=self.teacher1)
        story = Story.objects.create(
            parent=self.teacher1,
            title_en="Space Explorer",
            grade="Grade 3"
        )
        StoryPage.objects.create(story=story, page_number=1, text_en="Blast off to Mars!")

        url = reverse('teacher_story_detail', args=[story.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Space Explorer")
        self.assertEqual(len(response.data['pages']), 1)

    def test_update_story(self):
        self.client.force_authenticate(user=self.teacher1)
        story = Story.objects.create(
            parent=self.teacher1,
            title_en="Original Title",
            grade="Grade 2"
        )
        StoryPage.objects.create(story=story, page_number=1, text_en="Page 1")

        url = reverse('teacher_story_detail', args=[story.id])
        data = {
            "title_en": "Updated Space Adventure",
            "pages": [
                {"page_number": 1, "text_en": "Updated Page 1 text"},
                {"page_number": 2, "text_en": "New Page 2 text"}
            ]
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Updated Space Adventure")
        self.assertEqual(len(response.data['pages']), 2)

        story.refresh_from_db()
        self.assertEqual(story.title_en, "Updated Space Adventure")
        self.assertEqual(story.pages.count(), 2)

    def test_publish_story_classroom(self):
        self.client.force_authenticate(user=self.teacher1)
        story = Story.objects.create(
            parent=self.teacher1,
            title_en="Ocean Mysteries",
            grade="Grade 3"
        )
        StoryPage.objects.create(story=story, page_number=1, text_en="Dive into the deep ocean.")

        url = reverse('teacher_story_publish', args=[story.id])
        data = {
            "destination": "classroom",
            "classroom_id": self.classroom1.id,
            "assignment_title": "Read Ocean Mysteries this week",
            "instructions": "Read all pages and answer questions"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['assignment'])
        self.assertEqual(response.data['assignment']['students_assigned'], 2)

        # Check Assignment created
        assignment = ClassAssignment.objects.get(id=response.data['assignment']['id'])
        self.assertEqual(assignment.story, story)
        self.assertEqual(assignment.classroom, self.classroom1)
        self.assertEqual(ClassAssignmentStudent.objects.filter(assignment=assignment).count(), 2)

    def test_publish_story_specific_students(self):
        self.client.force_authenticate(user=self.teacher1)
        story = Story.objects.create(
            parent=self.teacher1,
            title_en="Reading Recovery Story",
            grade="Grade 3"
        )
        StoryPage.objects.create(story=story, page_number=1, text_en="Practice reading.")

        url = reverse('teacher_story_publish', args=[story.id])
        data = {
            "destination": "students",
            "classroom_id": self.classroom1.id,
            "student_ids": [self.child1.id],
            "assignment_title": "Targeted Reading"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['assignment']['students_assigned'], 1)

    def test_permission_denied_for_other_teacher(self):
        story = Story.objects.create(
            parent=self.teacher1,
            title_en="Private Teacher 1 Story"
        )
        # Teacher 2 attempts to update Teacher 1's story
        self.client.force_authenticate(user=self.teacher2)
        url = reverse('teacher_story_detail', args=[story.id])
        response = self.client.patch(url, {"title_en": "Hacked Title"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
