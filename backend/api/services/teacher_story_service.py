from django.db import transaction
from django.core.exceptions import ValidationError
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from api.models import (
    Story, StoryPage, TeacherClass, ClassAssignment, 
    ClassAssignmentStudent, ClassStudent, User
)
from api.gemini import generate_story_content

class TeacherStoryService:
    @staticmethod
    def generate_story(user, params):
        """
        Calls Gemini AI to generate a story draft with structured pages.
        Does not force a DB save so teacher can review/edit first in the editor.
        """
        title = params.get('title') or params.get('title_en') or ''
        child_name = params.get('characters') or params.get('child_name') or params.get('hero_name') or 'Alex'
        hero_animal = params.get('hero_animal') or 'friendly animal'
        setting = params.get('setting') or 'a magical school'
        learning_objective = params.get('learning_objective') or params.get('moral') or 'teamwork and curiosity'
        grade = params.get('grade') or params.get('grade_level') or 'grade-2'
        reading_difficulty = params.get('reading_difficulty') or params.get('reading_level') or 'medium'
        genre = params.get('genre') or params.get('story_mood') or 'adventure'
        story_length = params.get('story_length') or 'medium'
        num_pages = int(params.get('num_pages') or params.get('numPages') or 5)
        custom_prompt = params.get('custom_prompt') or params.get('keywords') or ''

        # Prepare parameters for gemini.generate_story_content
        gemini_params = {
            'childName': child_name,
            'childAge': 8,
            'childGender': 'other',
            'heroAnimal': hero_animal,
            'setting': setting,
            'moral': learning_objective,
            'grade': grade,
            'readingDifficulty': reading_difficulty,
            'storyMood': genre,
            'storyLength': story_length,
            'numPages': num_pages,
            'customPrompt': f"Story Title: {title}. Focus/Keywords: {custom_prompt}. Learning Objective: {learning_objective}",
            'language': params.get('language', 'bilingual')
        }

        try:
            story_data = generate_story_content(gemini_params)
        except Exception as e:
            raise ValidationError(f"AI Generation Error: {str(e)}")

        if not story_data or not isinstance(story_data, dict):
            raise ValidationError("AI story generation failed or returned an empty response. Please check your Gemini API key or try again.")

        pages = story_data.get('pages', [])
        if not pages:
            raise ValidationError("AI generator did not return story pages.")

        formatted_pages = []
        for idx, p in enumerate(pages, 1):
            formatted_pages.append({
                'page_number': idx,
                'text_en': p.get('text_en') or p.get('text') or '',
                'text_hi': p.get('text_hi') or '',
                'illustration_prompt': p.get('illustration_prompt') or f"Illustration for page {idx}: {title}"
            })

        return {
            'title_en': story_data.get('title_en') or title or 'A New Adventure',
            'title_hi': story_data.get('title_hi') or 'एक नया रोमांच',
            'grade': grade,
            'reading_difficulty': reading_difficulty,
            'story_mood': genre,
            'moral': learning_objective,
            'setting': setting,
            'hero_animal': hero_animal,
            'num_pages': len(formatted_pages),
            'pages': formatted_pages
        }

    @staticmethod
    @transaction.atomic
    def create_story(user, data):
        """
        Creates a new Story and its associated StoryPages authored by the teacher.
        """
        title_en = data.get('title_en') or data.get('title') or 'A New Story'
        title_hi = data.get('title_hi') or ''
        grade = data.get('grade') or data.get('grade_level') or 'Grade 2'
        reading_difficulty = data.get('reading_difficulty') or data.get('reading_level') or 'Intermediate'
        story_mood = data.get('story_mood') or data.get('genre') or 'Adventure'
        moral = data.get('moral') or data.get('learning_objective') or ''
        setting = data.get('setting') or ''
        hero_animal = data.get('hero_animal') or ''
        companion = data.get('companion') or ''
        cover_image_url = data.get('cover_image_url') or None
        pages_data = data.get('pages') or []

        if not pages_data:
            pages_data = [{
                'page_number': 1,
                'text_en': data.get('text_en', 'Once upon a time...'),
                'text_hi': '',
                'illustration_prompt': 'Story scene'
            }]

        story = Story.objects.create(
            parent=user,
            child=None,
            builder_mode='teacher',
            title_en=title_en,
            title_hi=title_hi,
            child_name=data.get('child_name') or 'Classroom',
            child_age=data.get('child_age') or 8,
            child_gender='other',
            grade=grade,
            reading_difficulty=reading_difficulty,
            story_mood=story_mood,
            moral=moral,
            setting=setting,
            hero_animal=hero_animal,
            companion=companion,
            cover_image_url=cover_image_url,
            num_pages=len(pages_data),
            language=data.get('language', 'bilingual')
        )

        for idx, p in enumerate(pages_data, 1):
            StoryPage.objects.create(
                story=story,
                page_number=p.get('page_number', idx),
                text_en=p.get('text_en', ''),
                text_hi=p.get('text_hi', ''),
                illustration_prompt=p.get('illustration_prompt', '')
            )

        return TeacherStoryService.serialize_story(story)

    @staticmethod
    def get_story(user, story_id):
        """
        Retrieves a story if owned by the teacher or if it is a system/public story.
        """
        try:
            story = Story.objects.prefetch_related('pages').get(id=story_id)
        except Story.DoesNotExist:
            raise ValidationError("Story not found.")

        if story.parent and story.parent != user and user.role != User.Role.ADMIN:
            raise PermissionDenied("You do not have permission to access this story.")

        return TeacherStoryService.serialize_story(story)

    @staticmethod
    @transaction.atomic
    def update_story(user, story_id, data):
        """
        Updates an existing story and its pages.
        """
        try:
            story = Story.objects.get(id=story_id)
        except Story.DoesNotExist:
            raise ValidationError("Story not found.")

        if story.parent != user and user.role != User.Role.ADMIN:
            raise PermissionDenied("You do not have permission to edit this story.")

        if 'title' in data or 'title_en' in data:
            story.title_en = data.get('title_en') or data.get('title')
        if 'title_hi' in data:
            story.title_hi = data.get('title_hi')
        if 'grade' in data or 'grade_level' in data:
            story.grade = data.get('grade') or data.get('grade_level')
        if 'reading_difficulty' in data or 'reading_level' in data:
            story.reading_difficulty = data.get('reading_difficulty') or data.get('reading_level')
        if 'story_mood' in data or 'genre' in data:
            story.story_mood = data.get('story_mood') or data.get('genre')
        if 'moral' in data or 'learning_objective' in data:
            story.moral = data.get('moral') or data.get('learning_objective')
        if 'setting' in data:
            story.setting = data.get('setting')
        if 'hero_animal' in data:
            story.hero_animal = data.get('hero_animal')
        if 'companion' in data:
            story.companion = data.get('companion')
        if 'cover_image_url' in data:
            story.cover_image_url = data.get('cover_image_url')

        pages_data = data.get('pages')
        if pages_data is not None:
            story.pages.all().delete()
            story.num_pages = len(pages_data)
            for idx, p in enumerate(pages_data, 1):
                StoryPage.objects.create(
                    story=story,
                    page_number=p.get('page_number', idx),
                    text_en=p.get('text_en', ''),
                    text_hi=p.get('text_hi', ''),
                    illustration_prompt=p.get('illustration_prompt', '')
                )

        story.save()
        return TeacherStoryService.serialize_story(story)

    @staticmethod
    @transaction.atomic
    def publish_story(user, story_id, data):
        """
        Publishes a story:
        - destination: 'library' | 'classroom' | 'students'
        - classroom_id: required if destination is 'classroom' or 'students'
        - student_ids: optional list of student IDs for specific students
        """
        try:
            story = Story.objects.get(id=story_id)
        except Story.DoesNotExist:
            raise ValidationError("Story not found.")

        if story.parent != user and user.role != User.Role.ADMIN:
            raise PermissionDenied("You do not have permission to publish this story.")

        destination = data.get('destination', 'library')
        classroom_id = data.get('classroom_id')
        student_ids = data.get('student_ids', [])

        assignment_created = None

        if destination in ['classroom', 'students']:
            if not classroom_id:
                raise ValidationError("Classroom is required to publish to a classroom or specific students.")

            try:
                classroom = TeacherClass.objects.get(id=classroom_id, teacher=user)
            except TeacherClass.DoesNotExist:
                raise ValidationError("Classroom not found or does not belong to you.")

            title = data.get('assignment_title') or f"Read: {story.title_en}"
            instructions = data.get('instructions') or f"Please read '{story.title_en}' carefully."
            due_date = data.get('due_date') or None

            target_all = (destination == 'classroom') or not student_ids

            assignment = ClassAssignment.objects.create(
                teacher=user,
                classroom=classroom,
                title=title,
                assignment_type='story',
                description=f"Story assignment: {story.title_en}",
                instructions=instructions,
                story=story,
                due_date=due_date,
                status='active',
                target_all_students=target_all,
                reading_level=story.reading_difficulty or 'All Levels'
            )

            # Enroll students
            if target_all:
                enrollments = ClassStudent.objects.filter(classroom=classroom, status='active')
            else:
                enrollments = ClassStudent.objects.filter(classroom=classroom, child_id__in=student_ids, status='active')

            for enrollment in enrollments:
                ClassAssignmentStudent.objects.create(
                    assignment=assignment,
                    child=enrollment.child,
                    status='assigned'
                )

            assignment_created = {
                'id': assignment.id,
                'title': assignment.title,
                'classroom_id': classroom.id,
                'classroom_name': classroom.name,
                'students_assigned': enrollments.count()
            }

        return {
            'story': TeacherStoryService.serialize_story(story),
            'destination': destination,
            'assignment': assignment_created,
            'message': f"Story '{story.title_en}' published successfully."
        }

    @staticmethod
    def serialize_story(story):
        pages = list(story.pages.all().order_by('page_number'))
        return {
            'id': story.id,
            'title': story.title_en,
            'title_en': story.title_en,
            'title_hi': story.title_hi,
            'grade': story.grade,
            'reading_level': story.reading_difficulty,
            'reading_difficulty': story.reading_difficulty,
            'genre': story.story_mood,
            'story_mood': story.story_mood,
            'moral': story.moral,
            'setting': story.setting,
            'hero_animal': story.hero_animal,
            'companion': story.companion,
            'cover_image_url': story.cover_image_url,
            'num_pages': len(pages),
            'created_at': story.created_at,
            'pages': [
                {
                    'id': p.id,
                    'page_number': p.page_number,
                    'text_en': p.text_en,
                    'text_hi': p.text_hi,
                    'illustration_prompt': p.illustration_prompt
                } for p in pages
            ]
        }
