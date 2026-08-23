from django.db import transaction
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from api.models import (
    ClassAssignment, ClassAssignmentStudent, TeacherClass, ClassStudent,
    Story, Quiz, Lesson, ChildProfile, User
)

class TeacherAssignmentService:
    @staticmethod
    def get_assignments(teacher, filters=None):
        filters = filters or {}
        queryset = ClassAssignment.objects.filter(teacher=teacher).select_related('classroom', 'story', 'quiz', 'lesson')

        status_filter = filters.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)

        classroom_id = filters.get('classroom_id')
        if classroom_id:
            queryset = queryset.filter(classroom_id=classroom_id)

        content_type = filters.get('content_type')
        if content_type and content_type != 'all':
            queryset = queryset.filter(assignment_type=content_type)
            
        search = filters.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)

        # Ordering
        order_by = filters.get('sort', '-created_at')
        if order_by in ['created_at', '-created_at', 'due_date', '-due_date']:
            queryset = queryset.order_by(order_by)

        return queryset

    @staticmethod
    def get_assignment(teacher, assignment_id):
        try:
            return ClassAssignment.objects.get(id=assignment_id, teacher=teacher)
        except ClassAssignment.DoesNotExist:
            raise DjangoValidationError("Assignment not found or access denied.")

    @staticmethod
    @transaction.atomic
    def create_assignment(teacher, data):
        classroom_id = data.get('classroom_id')
        title = data.get('title')
        assignment_type = data.get('content_type')
        content_id = data.get('content_id')
        target_type = data.get('target_type', 'classroom') # 'classroom' or 'student'
        student_ids = data.get('student_ids', [])
        
        if not title:
            raise DjangoValidationError("Title is required.")
        if not classroom_id:
            raise DjangoValidationError("Classroom is required.")
        
        try:
            classroom = TeacherClass.objects.get(id=classroom_id, teacher=teacher)
        except TeacherClass.DoesNotExist:
            raise DjangoValidationError("Classroom not found or access denied.")
            
        # Validate content
        story, quiz, lesson = None, None, None
        if assignment_type == 'story':
            try:
                story = Story.objects.get(id=content_id)
            except Story.DoesNotExist:
                raise DjangoValidationError("Story not found.")
        elif assignment_type == 'quiz':
            try:
                quiz = Quiz.objects.get(id=content_id)
            except Quiz.DoesNotExist:
                raise DjangoValidationError("Quiz not found.")
        elif assignment_type == 'lesson':
            try:
                lesson = Lesson.objects.get(id=content_id)
            except Lesson.DoesNotExist:
                raise DjangoValidationError("Lesson not found.")
        else:
            raise DjangoValidationError("Invalid assignment type.")

        # Handle dates
        due_date = data.get('due_date')
        start_date = data.get('start_date')
        
        assignment = ClassAssignment.objects.create(
            teacher=teacher,
            classroom=classroom,
            title=title,
            assignment_type=assignment_type,
            story=story,
            quiz=quiz,
            lesson=lesson,
            instructions=data.get('instructions', ''),
            start_date=start_date,
            due_date=due_date,
            status='draft',  # Created as draft initially
            target_all_students=(target_type == 'classroom')
        )
        
        is_published = data.get('publish', False)
        if is_published:
            TeacherAssignmentService._publish(assignment, target_type, student_ids)
            
        return assignment

    @staticmethod
    @transaction.atomic
    def update_assignment(teacher, assignment_id, data):
        assignment = TeacherAssignmentService.get_assignment(teacher, assignment_id)
        
        if assignment.status not in ['draft', 'active', 'scheduled']:
            raise DjangoValidationError(f"Cannot edit assignment in {assignment.status} state.")
            
        if 'title' in data:
            assignment.title = data['title']
        if 'instructions' in data:
            assignment.instructions = data['instructions']
        if 'due_date' in data:
            assignment.due_date = data['due_date']
        if 'start_date' in data:
            assignment.start_date = data['start_date']
            
        assignment.save()
        
        is_published = data.get('publish', False)
        if is_published and assignment.status == 'draft':
            target_type = data.get('target_type', 'classroom' if assignment.target_all_students else 'student')
            student_ids = data.get('student_ids', [])
            TeacherAssignmentService._publish(assignment, target_type, student_ids)
            
        return assignment

    @staticmethod
    @transaction.atomic
    def publish_assignment(teacher, assignment_id, target_type=None, student_ids=None):
        assignment = TeacherAssignmentService.get_assignment(teacher, assignment_id)
        if assignment.status != 'draft':
            raise DjangoValidationError("Only draft assignments can be published.")
            
        if target_type is None:
            target_type = 'classroom' if assignment.target_all_students else 'student'
            
        return TeacherAssignmentService._publish(assignment, target_type, student_ids)

    @staticmethod
    def _publish(assignment, target_type, student_ids=None):
        # Determine targets
        students_to_assign = []
        if target_type == 'classroom':
            assignment.target_all_students = True
            enrollments = ClassStudent.objects.filter(classroom=assignment.classroom, status='active')
            students_to_assign = [e.child for e in enrollments]
        else:
            assignment.target_all_students = False
            if not student_ids:
                raise DjangoValidationError("No students provided for targeted assignment.")
            enrollments = ClassStudent.objects.filter(classroom=assignment.classroom, child_id__in=student_ids, status='active')
            students_to_assign = [e.child for e in enrollments]
            if len(students_to_assign) != len(student_ids):
                raise DjangoValidationError("One or more selected students are not in this classroom.")
                
        # Create recipient records
        assignment_students = []
        for child in students_to_assign:
            if not ClassAssignmentStudent.objects.filter(assignment=assignment, child=child).exists():
                assignment_students.append(
                    ClassAssignmentStudent(
                        assignment=assignment,
                        child=child,
                        status='assigned'
                    )
                )
        
        if assignment_students:
            ClassAssignmentStudent.objects.bulk_create(assignment_students)
            
        assignment.status = 'active'
        assignment.save()
        return assignment

    @staticmethod
    @transaction.atomic
    def archive_assignment(teacher, assignment_id):
        assignment = TeacherAssignmentService.get_assignment(teacher, assignment_id)
        assignment.status = 'archived'
        assignment.save()
        return assignment

    @staticmethod
    @transaction.atomic
    def duplicate_assignment(teacher, assignment_id):
        original = TeacherAssignmentService.get_assignment(teacher, assignment_id)
        
        new_assignment = ClassAssignment.objects.create(
            teacher=original.teacher,
            classroom=original.classroom,
            title=f"{original.title} (Copy)",
            assignment_type=original.assignment_type,
            story=original.story,
            quiz=original.quiz,
            lesson=original.lesson,
            instructions=original.instructions,
            reading_level=original.reading_level,
            target_all_students=original.target_all_students,
            status='draft'
        )
        return new_assignment

    @staticmethod
    def get_assignment_stats(assignment):
        recipients = ClassAssignmentStudent.objects.filter(assignment=assignment)
        total = recipients.count()
        # For simplicity, treat 'submitted', 'reviewed', 'completed' as completed.
        completed = recipients.filter(status__in=['submitted', 'reviewed', 'completed']).count()
        in_progress = recipients.filter(status='in_progress').count()
        not_started = recipients.filter(status='assigned').count()
        
        return {
            'assigned': total,
            'completed': completed,
            'in_progress': in_progress,
            'not_started': not_started,
            'completion_percentage': int(round((completed / total) * 100)) if total > 0 else 0
        }
        
    @staticmethod
    def get_recipients(teacher, assignment_id):
        assignment = TeacherAssignmentService.get_assignment(teacher, assignment_id)
        return ClassAssignmentStudent.objects.filter(assignment=assignment).select_related('child')
