from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from api.models import User, TeacherProfile

class TeacherSettingsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.teacher = User.objects.create_user(
            username='teacher_set1',
            first_name='Maria',
            last_name='Sharma',
            password='password123',
            role=User.Role.TEACHER
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher,
            school_name='Oakridge Elementary',
            bio='Passionate Teacher'
        )

    def test_get_settings_unauthorized(self):
        url = reverse('teacher_settings_all')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    def test_get_settings_success(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('teacher_settings_all')
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['profile']['name'], 'Maria Sharma')
        self.assertEqual(response.data['profile']['school_name'], 'Oakridge Elementary')

    def test_update_profile(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('teacher_settings_profile')
        data = {
            'name': 'Maria Gupta',
            'school_name': 'Greenwood High',
            'bio': 'Updated Teacher Bio'
        }
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Maria Gupta')
        self.assertEqual(response.data['school_name'], 'Greenwood High')

        # Check DB persistence
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.school_name, 'Greenwood High')

    def test_update_preferences(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('teacher_settings_preferences')
        data = {'theme_preference': 'dark'}
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['theme_preference'], 'dark')

        self.profile.refresh_from_db()
        self.assertEqual(self.profile.theme_preference, 'dark')

    def test_change_password(self):
        self.client.force_authenticate(user=self.teacher)
        url = reverse('auth_change_password')
        data = {
            'old_password': 'password123',
            'new_password': 'newpassword456'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)

        # Verify new password
        self.teacher.refresh_from_db()
        self.assertTrue(self.teacher.check_password('newpassword456'))
