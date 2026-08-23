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
        classroom = TeacherClassroomService.get_classroom(user, classroom_id)
        
        try:
            membership = ClassStudent.objects.get(
                classroom=classroom,
                child_id=student_id,
                status='active'
            )
            child = membership.child
            
            # Get stats
            recent_reads = ReadingLog.objects.filter(
                child=child
            ).select_related('story').order_by('-created_at')[:5]
            
            recent_quizzes = QuizAttempt.objects.filter(
                child=child
            ).select_related('quiz').order_by('-attempted_at')[:5]
            
            stories_completed = ReadingLog.objects.filter(child=child, completed=True).count()
            
            quiz_avg = QuizAttempt.objects.filter(child=child).aggregate(avg=Avg('percentage'))['avg']
            
            # streak
            try:
                streak = child.streak.current_streak
            except hasattr(child, 'streak'):
                streak = 0
            
            return {
                "id": child.id,
                "name": child.name,
                "avatar_url": child.avatar_url,
                "classroom_name": classroom.name,
                "joined_at": membership.enrolled_at,
                "stats": {
                    "reading_streak": streak,
                    "stories_completed": stories_completed,
                    "average_quiz": int(round(quiz_avg)) if quiz_avg else 0,
                    "overall_progress": int(round(quiz_avg)) if quiz_avg else 0
                },
                "recent_reads": [
                    {
                        "id": r.id,
                        "title": r.story.title_en if r.story else r.story_title,
                        "completed": r.completed,
                        "timestamp": r.created_at
                    } for r in recent_reads
                ],
                "recent_quizzes": [
                    {
                        "id": q.id,
                        "title": q.quiz.title,
                        "percentage": q.percentage,
                        "timestamp": q.attempted_at
                    } for q in recent_quizzes
                ]
            }
        except ClassStudent.DoesNotExist:
            raise ValidationError("Student is not active in this classroom.")
