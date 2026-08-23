from django.db.models import Q, Count
from api.models import Story, Lesson, Quiz

class TeacherLibraryService:
    @staticmethod
    def get_library_feed(user, filters):
        """
        Retrieves normalized content from Story, Lesson, and Quiz.
        Filters: type, search, grade, created_by_me (boolean)
        """
        content_type = filters.get('type', 'all')
        search_query = filters.get('search', '').strip()
        grade_filter = filters.get('grade', '')
        created_by_me = filters.get('created_by_me', 'false').lower() == 'true'

        results = []

        # 1. Fetch Stories
        if content_type in ['all', 'story']:
            # Either owned by the teacher or system (parent is null)
            if created_by_me:
                stories = Story.objects.filter(parent=user)
            else:
                stories = Story.objects.filter(Q(parent=user) | Q(parent__isnull=True))

            if search_query:
                stories = stories.filter(
                    Q(title_en__icontains=search_query) | 
                    Q(title_hi__icontains=search_query) |
                    Q(child_name__icontains=search_query)
                )
            
            if grade_filter and grade_filter != 'All Grades':
                # Convert frontend "Grade 2" to backend format if needed, 
                # but backend grade field usually holds strings like 'grade-2' or 'Grade 2'
                # Let's do icontains just in case.
                stories = stories.filter(grade__icontains=grade_filter.replace(' ', '-'))

            for story in stories.order_by('-created_at')[:50]: # Limit for performance if joining in python
                creator_type = "teacher" if story.parent == user else "system"
                creator_name = "Me" if story.parent == user else "StoryNest"
                
                results.append({
                    "id": story.id,
                    "type": "story",
                    "title": story.title_en,
                    "description": f"A story about {story.hero_animal or 'a hero'} in {story.setting or 'a magical world'}.",
                    "cover_image": story.cover_image_url,
                    "grade": story.grade,
                    "reading_level": story.reading_difficulty,
                    "genre": story.story_mood or "Adventure",
                    "estimated_minutes": story.num_pages * 2,
                    "creator": {
                        "type": creator_type,
                        "name": creator_name
                    },
                    "status": "active",
                    "created_at": story.created_at
                })

        # 2. Fetch Lessons
        if content_type in ['all', 'lesson']:
            if created_by_me:
                lessons = Lesson.objects.filter(teacher=user)
            else:
                lessons = Lesson.objects.filter(Q(teacher=user) | Q(teacher__role='ADMIN'))

            if search_query:
                lessons = lessons.filter(title__icontains=search_query)
                
            if grade_filter and grade_filter != 'All Grades':
                lessons = lessons.filter(grade__icontains=grade_filter)

            for lesson in lessons.order_by('-created_at')[:50]:
                creator_type = "teacher" if lesson.teacher == user else "system"
                creator_name = "Me" if lesson.teacher == user else "StoryNest"
                
                results.append({
                    "id": lesson.id,
                    "type": "lesson",
                    "title": lesson.title,
                    "description": lesson.description or "A reading lesson.",
                    "cover_image": None,
                    "grade": lesson.grade,
                    "reading_level": "All Levels",
                    "genre": "Education",
                    "estimated_minutes": 15,
                    "creator": {
                        "type": creator_type,
                        "name": creator_name
                    },
                    "status": lesson.status,
                    "created_at": lesson.created_at
                })

        # 3. Fetch Quizzes
        if content_type in ['all', 'quiz']:
            # Quizzes are tied to stories.
            if created_by_me:
                quizzes = Quiz.objects.filter(story__parent=user)
            else:
                quizzes = Quiz.objects.filter(Q(story__parent=user) | Q(story__parent__isnull=True))

            if search_query:
                quizzes = quizzes.filter(title__icontains=search_query)
                
            if grade_filter and grade_filter != 'All Grades':
                quizzes = quizzes.filter(story__grade__icontains=grade_filter.replace(' ', '-'))
                
            quizzes = quizzes.annotate(num_questions=Count('questions'))

            for quiz in quizzes.order_by('-created_at')[:50]:
                creator_type = "teacher" if quiz.story.parent == user else "system"
                creator_name = "Me" if quiz.story.parent == user else "StoryNest"
                
                results.append({
                    "id": quiz.id,
                    "type": "quiz",
                    "title": quiz.title,
                    "description": f"Comprehension check containing {quiz.num_questions} questions.",
                    "cover_image": quiz.story.cover_image_url if quiz.story else None,
                    "grade": quiz.story.grade if quiz.story else "All Grades",
                    "reading_level": quiz.story.reading_difficulty if quiz.story else "All Levels",
                    "genre": "Assessment",
                    "estimated_minutes": quiz.num_questions * 2,
                    "creator": {
                        "type": creator_type,
                        "name": creator_name
                    },
                    "status": "active",
                    "created_at": quiz.created_at
                })

        # Sort combined results by created_at descending
        results.sort(key=lambda x: x['created_at'], reverse=True)
        return results

    @staticmethod
    def get_story_preview(user, story_id):
        try:
            story = Story.objects.get(id=story_id)
            if story.parent and story.parent != user:
                raise Exception("Unauthorized to view this story.")
            
            # Fetch pages
            pages = story.pages.all()
            return {
                "id": story.id,
                "title_en": story.title_en,
                "description": f"A story about {story.hero_animal or 'a hero'} in {story.setting or 'a magical world'}.",
                "cover_image_url": story.cover_image_url,
                "grade": story.grade,
                "reading_difficulty": story.reading_difficulty,
                "pages": [{"page_number": p.page_number, "text_en": p.text_en} for p in pages],
                "num_pages": story.num_pages,
            }
        except Story.DoesNotExist:
            raise Exception("Story not found.")

    @staticmethod
    def get_lesson_preview(user, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
            if lesson.teacher and lesson.teacher != user:
                raise Exception("Unauthorized to view this lesson.")
            return {
                "id": lesson.id,
                "title": lesson.title,
                "description": lesson.description,
                "grade": lesson.grade,
                "status": lesson.status,
            }
        except Lesson.DoesNotExist:
            raise Exception("Lesson not found.")

    @staticmethod
    def get_quiz_preview(user, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            if quiz.story.parent and quiz.story.parent != user:
                raise Exception("Unauthorized to view this quiz.")
            questions = quiz.questions.all()
            return {
                "id": quiz.id,
                "title": quiz.title,
                "questions": [
                    {
                        "question_text": q.question_text,
                        "options": [q.option_a, q.option_b, q.option_c, q.option_d],
                        "correct_option": q.correct_option
                    } for q in questions
                ]
            }
        except Quiz.DoesNotExist:
            raise Exception("Quiz not found.")
