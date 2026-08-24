from django.db import transaction
from django.db.models import Count, Q, Avg
from django.core.exceptions import ValidationError
from django.utils import timezone
from api.models import (
    TeacherClass, ClassStudent, ChildProfile, QuizAttempt, ReadingLog
)

class TeacherClassroomService:
    @staticmethod
    def get_classrooms(user, status=None):
        """Get all classrooms for a teacher."""
        qs = TeacherClass.objects.filter(teacher=user)
        if status:
            qs = qs.filter(status=status)
            
        # Annotate with basic stats to avoid N+1 queries
        qs = qs.annotate(
            active_students=Count('enrolled_students', filter=Q(enrolled_students__status='active'))
        )
        return qs.order_by('-created_at')

    @staticmethod
    def get_classroom(user, classroom_id):
        """Get a specific classroom, ensuring the teacher owns it."""
        try:
            return TeacherClass.objects.get(id=classroom_id, teacher=user)
        except TeacherClass.DoesNotExist:
            raise ValidationError("Classroom not found or you don't have permission.")

    @staticmethod
    def create_classroom(user, data):
        """Create a new classroom for a teacher."""
        name = data.get('name')
        if not name or len(name.strip()) == 0:
            raise ValidationError("Classroom name is required.")
        
        # Check for exact duplicate active classroom for this teacher
        academic_year = data.get('academic_year', '2026-2027')
        if TeacherClass.objects.filter(
            teacher=user, 
            name__iexact=name.strip(), 
            academic_year=academic_year,
            status='active'
        ).exists():
            raise ValidationError(f"You already have an active classroom named '{name}' for {academic_year}.")
            
        classroom = TeacherClass.objects.create(
            teacher=user,
            name=name.strip(),
            grade_level=data.get('grade', 'Grade 1'),
            section=data.get('section', ''),
            subject=data.get('subject', 'Reading & Literature'),
            description=data.get('description', ''),
            academic_year=academic_year,
            status='active'
        )
        return classroom

    @staticmethod
    def update_classroom(user, classroom_id, data):
        """Update an existing classroom."""
        classroom = TeacherClassroomService.get_classroom(user, classroom_id)
        
        if 'name' in data:
            name = data['name']
            if not name or len(name.strip()) == 0:
                raise ValidationError("Classroom name is required.")
            classroom.name = name.strip()
            
        if 'grade' in data: classroom.grade_level = data['grade']
        if 'section' in data: classroom.section = data['section']
        if 'subject' in data: classroom.subject = data['subject']
        if 'description' in data: classroom.description = data['description']
        if 'academic_year' in data: classroom.academic_year = data['academic_year']
        
        classroom.save()
        return classroom

    @staticmethod
    def archive_classroom(user, classroom_id):
        """Soft-delete (archive) a classroom."""
        classroom = TeacherClassroomService.get_classroom(user, classroom_id)
        classroom.status = 'archived'
        classroom.save()
        return classroom

    @staticmethod
    def get_classroom_stats(classroom):
        """Calculate overview stats for a classroom."""
        enrolled = ClassStudent.objects.filter(classroom=classroom, status='active')
        student_count = enrolled.count()
        
        if student_count == 0:
            return {
                "student_count": 0,
                "average_progress": 0,
                "average_reading": 0,
                "active_readers": 0
            }
            
        child_ids = list(enrolled.values_list('child_id', flat=True))
        
        # simplified avg progress from quiz attempts
        quiz_avg = QuizAttempt.objects.filter(
            child_id__in=child_ids
        ).aggregate(avg=Avg('percentage'))['avg']
        
        # calculate active readers (read in last 7 days)
        seven_days_ago = timezone.now() - timezone.timedelta(days=7)
        active_readers = ReadingLog.objects.filter(
            child_id__in=child_ids,
            created_at__gte=seven_days_ago
        ).values('child_id').distinct().count()
        
        return {
            "student_count": student_count,
            "average_progress": int(round(quiz_avg)) if quiz_avg else 0,
            "average_reading": 75, # Mock metric for this phase
            "active_readers": active_readers
        }

    @staticmethod
    def get_students(classroom):
        """Get all active students in a classroom with basic stats."""
        memberships = ClassStudent.objects.filter(
            classroom=classroom, 
            status='active'
        ).select_related('child')
        return memberships

    @staticmethod
    @transaction.atomic
    def add_students(user, classroom_id, student_ids):
        """Add multiple students to a classroom safely."""
        classroom = TeacherClassroomService.get_classroom(user, classroom_id)
        
        if not student_ids or not isinstance(student_ids, list):
            raise ValidationError("A list of student IDs is required.")
            
        # Verify all students exist
        children = ChildProfile.objects.filter(id__in=student_ids)
        if children.count() != len(set(student_ids)):
            raise ValidationError("One or more selected students do not exist.")
            
        added_count = 0
        for child in children:
            # Check if membership already exists (including removed)
            membership, created = ClassStudent.objects.get_or_create(
                classroom=classroom,
                child=child,
                defaults={'status': 'active'}
            )
            
            if not created and membership.status != 'active':
                # Reactivate removed student
                membership.status = 'active'
                membership.save()
                added_count += 1
            elif created:
                added_count += 1
                
        return added_count

    @staticmethod
    def remove_student(user, classroom_id, student_id):
        """Soft-remove a student from a classroom."""
        classroom = TeacherClassroomService.get_classroom(user, classroom_id)
        
        try:
            membership = ClassStudent.objects.get(
                classroom=classroom, 
                child_id=student_id,
                status='active'
            )
            membership.status = 'removed'
            membership.save()
            return True
        except ClassStudent.DoesNotExist:
            raise ValidationError("Student is not active in this classroom.")

    @staticmethod
    def get_student_summary(user, classroom_id, student_id):
        """Get a specific student's summary contextually within this classroom."""
        return TeacherClassroomService.get_student_dashboard(user, classroom_id, student_id)

    @staticmethod
    def get_student_dashboard(user, classroom_id, student_id):
        """
        Get the full Student Learning Dashboard matching the Parent Child Dashboard,
        including reading streak, books read, total minutes, weekly calendar,
        recent reading sessions, story ideas, achievements, and assigned tasks.
        """
        classroom = TeacherClassroomService.get_classroom(user, classroom_id)
        
        try:
            membership = ClassStudent.objects.get(
                classroom=classroom,
                child_id=student_id,
                status='active'
            )
            child = membership.child
        except ClassStudent.DoesNotExist:
            raise ValidationError("Student is not active in this classroom.")

        from datetime import timedelta
        from django.db.models import Sum
        from api.parent_views import calculate_streak_for_child, evaluate_child_achievements
        from api.models import Achievement, ChildAchievement, ClassAssignmentStudent, Story

        # Streak & Logs
        streak = calculate_streak_for_child(child)
        logs = ReadingLog.objects.filter(child=child)
        total_books_read = logs.filter(completed=True).count()
        total_minutes = logs.aggregate(total=Sum('reading_time_minutes'))['total'] or 0

        # Weekly Activity (Mon - Sun of current week)
        today = timezone.localdate()
        start_of_week = today - timedelta(days=today.weekday())
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        week_days = []
        for i in range(7):
            d = start_of_week + timedelta(days=i)
            day_mins = logs.filter(read_date=d).aggregate(total=Sum('reading_time_minutes'))['total'] or 0
            week_days.append({
                "day": day_names[i],
                "date": str(d),
                "minutes": day_mins,
                "read": day_mins > 0
            })

        # Recent Reading Sessions
        recent_logs = logs.select_related('story').order_by('-read_date', '-created_at')[:6]
        recent_stories = []
        for log in recent_logs:
            lang = "EN"
            if log.story:
                lang_val = (log.story.language or "bilingual").lower()
                if "bi" in lang_val:
                    lang = "EN/HI"
                elif "hi" in lang_val:
                    lang = "HI"
            progress = 100 if log.completed else min(
                100,
                int((log.pages_read / max(1, log.story.num_pages if log.story else 5)) * 100)
            )
            date_str = (
                "Today" if log.read_date == today
                else ("Yesterday" if log.read_date == (today - timedelta(days=1))
                      else log.read_date.strftime("%b %d"))
            )
            recent_stories.append({
                "id": log.id,
                "story_id": log.story.id if log.story else None,
                "title": log.story_title or (log.story.title_en if log.story else "Story Read"),
                "lang": lang,
                "date": date_str,
                "progress": progress,
                "completed": log.completed,
                "minutes": log.reading_time_minutes,
                "pages": log.pages_read,
                "rating": log.rating
            })

        # Quiz Average & Recent Quizzes
        quiz_attempts = QuizAttempt.objects.filter(child=child).select_related('quiz').order_by('-attempted_at')
        quiz_avg = quiz_attempts.aggregate(avg=Avg('percentage'))['avg'] or 0
        recent_quizzes = [
            {
                "id": q.id,
                "title": q.quiz.title if q.quiz else "Reading Quiz",
                "percentage": q.percentage,
                "timestamp": q.attempted_at
            } for q in quiz_attempts[:5]
        ]

        # Story Recommendations / Ideas
        story_ideas = [
            {
                "prompt": f"A creative adventure where {child.name} discovers an enchanted library in space",
                "theme": "Adventure & Sci-Fi",
                "difficulty": child.grade_level or "Grade 2"
            },
            {
                "prompt": f"How {child.name} and classmates built a bridge across the talking crystal river",
                "theme": "Teamwork & Friendship",
                "difficulty": child.grade_level or "Grade 2"
            },
            {
                "prompt": f"A delightful mystery where {child.name} solves the riddle of the missing constellation",
                "theme": "Mystery & Logic",
                "difficulty": child.grade_level or "Grade 2"
            }
        ]

        # Achievements & Badges
        evaluate_child_achievements(child)
        all_achievements = Achievement.objects.all()
        earned_achievements = {
            ca.achievement_id: ca.earned_at
            for ca in ChildAchievement.objects.filter(child=child)
        }
        achievements_list = []
        for ach in all_achievements:
            achievements_list.append({
                "id": ach.id,
                "code": ach.code,
                "name": ach.name,
                "description": ach.description,
                "emoji": ach.emoji,
                "earned": ach.id in earned_achievements,
                "earned_at": earned_achievements.get(ach.id)
            })

        # Assigned Tasks (Teacher Assignments)
        assigned_students = ClassAssignmentStudent.objects.filter(
            assignment__classroom=classroom,
            child=child
        ).select_related('assignment', 'assignment__story', 'assignment__classroom').order_by('-assignment__created_at')

        assigned_tasks = []
        for asg in assigned_students:
            a = asg.assignment
            assigned_tasks.append({
                "id": a.id,
                "title": a.title or (a.story.title_en if a.story else "Reading Task"),
                "type": a.assignment_type,
                "due_date": a.due_date,
                "status": asg.status,
                "completed_at": asg.completed_at,
                "score": asg.score,
                "classroom_name": classroom.name
            })

        avatar_str = child.avatar or '🦁'
        avatar_url = avatar_str if (avatar_str.startswith('http') or '/' in avatar_str) else f"https://api.dicebear.com/7.x/fun-emoji/svg?seed={child.name}"

        return {
            "child": {
                "id": child.id,
                "name": child.name,
                "age": child.age,
                "grade": child.grade_level,
                "grade_level": child.grade_level,
                "reading_level": child.reading_level,
                "preferred_language": child.preferred_language,
                "avatar": avatar_str,
                "avatar_url": avatar_url,
                "interests": child.interests,
                "classroom_id": classroom.id,
                "classroom_name": classroom.name,
                "joined_at": membership.enrolled_at
            },
            "stats": {
                "reading_streak": streak,
                "current_streak": streak,
                "total_books_read": total_books_read,
                "stories_completed": total_books_read,
                "total_minutes": total_minutes,
                "average_quiz": int(round(quiz_avg)),
                "quiz_average": round(quiz_avg, 1)
            },
            "weekly_activity": week_days,
            "recent_stories": recent_stories,
            "recent_reads": recent_stories,
            "recent_quizzes": recent_quizzes,
            "story_ideas": story_ideas,
            "achievements": achievements_list,
            "assigned_tasks": assigned_tasks
        }

    @staticmethod
    def get_student_reading_logs(user, classroom_id, student_id):
        """Get all reading logs for a specific student."""
        classroom = TeacherClassroomService.get_classroom(user, classroom_id)
        
        if not ClassStudent.objects.filter(classroom=classroom, child_id=student_id, status='active').exists():
            raise ValidationError("Student is not active in this classroom.")

        logs = ReadingLog.objects.filter(child_id=student_id).select_related('story').order_by('-read_date', '-created_at')
        return [
            {
                "id": log.id,
                "story_id": log.story_id,
                "story_title": log.story_title or (log.story.title_en if log.story else "Story Read"),
                "read_date": log.read_date,
                "reading_time_minutes": log.reading_time_minutes,
                "pages_read": log.pages_read,
                "completed": log.completed,
                "rating": log.rating,
                "notes": log.notes,
                "created_at": log.created_at
            }
            for log in logs
        ]

    @staticmethod
    @transaction.atomic
    def create_student_reading_log(user, classroom_id, student_id, log_data):
        """Log a reading session for a student in the teacher's classroom."""
        classroom = TeacherClassroomService.get_classroom(user, classroom_id)
        
        try:
            membership = ClassStudent.objects.get(classroom=classroom, child_id=student_id, status='active')
            child = membership.child
        except ClassStudent.DoesNotExist:
            raise ValidationError("Student is not active in this classroom.")

        from api.parent_views import evaluate_child_achievements, calculate_streak_for_child
        from api.models import Story

        story_id = log_data.get('story') or log_data.get('story_id')
        story_obj = None
        if story_id:
            try:
                story_obj = Story.objects.get(id=story_id)
            except Story.DoesNotExist:
                story_obj = None

        story_title = log_data.get('story_title') or (story_obj.title_en if story_obj else 'Story Read')
        read_date = log_data.get('read_date') or timezone.localdate()
        reading_time_minutes = int(log_data.get('reading_time_minutes') or 20)
        pages_read = int(log_data.get('pages_read') or (story_obj.num_pages if story_obj else 5))
        completed = bool(log_data.get('completed', True))
        rating = int(log_data.get('rating') or 5)
        notes = log_data.get('notes', '')

        log = ReadingLog.objects.create(
            child=child,
            story=story_obj,
            story_title=story_title,
            read_date=read_date,
            reading_time_minutes=reading_time_minutes,
            pages_read=pages_read,
            completed=completed,
            rating=rating,
            notes=notes
        )

        evaluate_child_achievements(child)

        # Update assignment student records
        from api.models import ClassAssignmentStudent
        assignment_id = log_data.get('assignment_id')
        new_status = 'completed' if completed else 'in_progress'
        comp_time = timezone.now() if completed else None
        new_score = 100 if completed else 0

        if assignment_id:
            ClassAssignmentStudent.objects.filter(
                assignment_id=assignment_id,
                child=child
            ).update(
                status=new_status,
                completed_at=comp_time,
                score=new_score
            )

        if story_obj:
            ClassAssignmentStudent.objects.filter(
                assignment__story=story_obj,
                child=child
            ).update(
                status=new_status,
                completed_at=comp_time,
                score=new_score
            )

        if story_title:
            cleaned_title = story_title.replace('Read:', '').replace('Read', '').strip()
            ClassAssignmentStudent.objects.filter(
                Q(assignment__title__icontains=cleaned_title) | Q(assignment__story__title_en__icontains=cleaned_title),
                child=child
            ).update(
                status=new_status,
                completed_at=comp_time,
                score=new_score
            )

        return {
            "id": log.id,
            "story_id": log.story_id,
            "story_title": log.story_title,
            "read_date": log.read_date,
            "reading_time_minutes": log.reading_time_minutes,
            "pages_read": log.pages_read,
            "completed": log.completed,
            "rating": log.rating,
            "notes": log.notes,
            "created_at": log.created_at
        }

    @staticmethod
    def delete_student_reading_log(user, classroom_id, student_id, log_id):
        """Delete a reading log for a student."""
        classroom = TeacherClassroomService.get_classroom(user, classroom_id)
        
        if not ClassStudent.objects.filter(classroom=classroom, child_id=student_id, status='active').exists():
            raise ValidationError("Student is not active in this classroom.")

        try:
            log = ReadingLog.objects.get(id=log_id, child_id=student_id)
            log.delete()
            return True
        except ReadingLog.DoesNotExist:
            raise ValidationError("Reading log not found.")

    @staticmethod
    def get_student_assignments(user, classroom_id, student_id):
        """Get all assignments for this student in this classroom."""
        classroom = TeacherClassroomService.get_classroom(user, classroom_id)
        
        if not ClassStudent.objects.filter(classroom=classroom, child_id=student_id, status='active').exists():
            raise ValidationError("Student is not active in this classroom.")

        from api.models import ClassAssignment, ClassAssignmentStudent

        # Reconcile any active classroom assignments that target all students
        class_assignments = ClassAssignment.objects.filter(
            classroom=classroom,
            target_all_students=True,
            status__in=['active', 'completed', 'scheduled']
        )
        for ca in class_assignments:
            ClassAssignmentStudent.objects.get_or_create(
                assignment=ca,
                child_id=student_id,
                defaults={'status': 'assigned'}
            )

        assigned = ClassAssignmentStudent.objects.filter(
            assignment__classroom=classroom,
            child_id=student_id
        ).select_related('assignment', 'assignment__story', 'assignment__quiz', 'assignment__lesson').order_by('-assignment__created_at')

        results = []
        for a in assigned:
            story = a.assignment.story
            
            # Synchronize with any completed ReadingLog for this story/title
            if a.status != 'completed' and a.assignment.assignment_type == 'story':
                log_q = Q(child_id=student_id, completed=True)
                if story:
                    log_q &= (Q(story=story) | Q(story_title__icontains=story.title_en))
                if a.assignment.title:
                    clean_title = a.assignment.title.replace('Read:', '').replace('Read', '').strip()
                    log_q |= Q(child_id=student_id, completed=True, story_title__icontains=clean_title)

                matching_log = ReadingLog.objects.filter(log_q).first()
                if matching_log:
                    a.status = 'completed'
                    a.completed_at = matching_log.created_at
                    a.score = 100
                    a.save(update_fields=['status', 'completed_at', 'score'])

            results.append({
                "id": a.assignment.id,
                "story_id": story.id if story else None,
                "assignment_student_id": a.id,
                "title": a.assignment.title or (story.title_en if story else "Assignment"),
                "type": a.assignment.assignment_type,
                "due_date": a.assignment.due_date,
                "status": a.status,
                "completed_at": a.completed_at,
                "score": a.score,
                "created_at": a.assignment.created_at
            })

        return results

    @staticmethod
    @transaction.atomic
    def create_student(user, data):
        """
        Create a new ChildProfile (student) and optionally enroll them into one of the teacher's classrooms.
        """
        name = data.get('name', '').strip()
        if not name:
            raise ValidationError("Student name is required.")

        age = data.get('age')
        if age:
            try:
                age = int(age)
                if age < 1 or age > 18:
                    raise ValidationError("Age must be between 1 and 18.")
            except (ValueError, TypeError):
                raise ValidationError("Age must be a valid number.")
        else:
            age = 7

        grade_level = data.get('grade_level') or data.get('grade') or 'Grade 2'
        reading_level = data.get('reading_level') or 'Beginner'
        gender = data.get('gender') or 'boy'
        if gender not in ['boy', 'girl', 'other']:
            gender = 'boy'

        dob = data.get('dob') or None
        preferred_language = data.get('preferred_language') or 'Bilingual (EN/HI)'
        avatar = data.get('avatar') or '🦁'
        interests = data.get('interests') or 'Animals, Space, Magic'

        child = ChildProfile.objects.create(
            name=name,
            age=age,
            dob=dob,
            gender=gender,
            grade_level=grade_level,
            reading_level=reading_level,
            preferred_language=preferred_language,
            avatar=avatar,
            interests=interests
        )

        classroom_id = data.get('classroom_id')
        enrolled_classroom = None
        if classroom_id:
            classroom = TeacherClassroomService.get_classroom(user, classroom_id)
            ClassStudent.objects.create(
                classroom=classroom,
                child=child,
                status='active'
            )
            enrolled_classroom = {
                'id': classroom.id,
                'name': classroom.name
            }

        return {
            'id': child.id,
            'name': child.name,
            'age': child.age,
            'grade_level': child.grade_level,
            'reading_level': child.reading_level,
            'avatar': child.avatar,
            'classroom': enrolled_classroom
        }
