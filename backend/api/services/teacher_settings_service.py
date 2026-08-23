from api.models import User, TeacherProfile

class TeacherSettingsService:
    @staticmethod
    def get_or_create_profile(user):
        profile, _ = TeacherProfile.objects.get_or_create(user=user)
        return profile

    @classmethod
    def get_settings(cls, user):
        profile = cls.get_or_create_profile(user)
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username
        
        return {
            'profile': {
                'username': user.username,
                'name': full_name,
                'email': user.email or '',
                'phone': user.phone or '',
                'school_name': profile.school_name,
                'grade_level': profile.grade_level,
                'subject': profile.subject,
                'bio': profile.bio,
                'avatar': profile.avatar
            },
            'preferences': {
                'theme_preference': profile.theme_preference,
                'preferred_language': 'en'
            },
            'notifications': {
                'email_notifications': profile.email_notifications,
                'assignment_notifications': True,
                'student_progress_alerts': True,
                'system_updates': True
            }
        }

    @classmethod
    def update_profile(cls, user, data):
        profile = cls.get_or_create_profile(user)
        
        if 'name' in data:
            parts = data['name'].strip().split(' ', 1)
            user.first_name = parts[0]
            user.last_name = parts[1] if len(parts) > 1 else ''
        if 'phone' in data:
            user.phone = data['phone']
        user.save()

        if 'school_name' in data:
            profile.school_name = data['school_name']
        if 'grade_level' in data:
            profile.grade_level = data['grade_level']
        if 'subject' in data:
            profile.subject = data['subject']
        if 'bio' in data:
            profile.bio = data['bio']
        if 'avatar' in data:
            profile.avatar = data['avatar']
        profile.save()

        return cls.get_settings(user)['profile']

    @classmethod
    def update_preferences(cls, user, data):
        profile = cls.get_or_create_profile(user)
        
        if 'theme_preference' in data:
            profile.theme_preference = data['theme_preference']
            profile.save()

        return cls.get_settings(user)['preferences']

    @classmethod
    def update_notifications(cls, user, data):
        profile = cls.get_or_create_profile(user)
        
        if 'email_notifications' in data:
            profile.email_notifications = bool(data['email_notifications'])
            profile.save()

        return cls.get_settings(user)['notifications']
