from django.db import transaction
from django.core.exceptions import ValidationError as DjangoValidationError, PermissionDenied
from django.utils import timezone
from django.db.models import Q, Count, Avg
from api.models import (
    ClassAssignment, ClassAssignmentStudent, TeacherClass, ClassStudent,
    Story, Quiz, Lesson, ChildProfile, User
)

class TeacherAssignmentService:
    @staticmethod
    def _parse_date(val):
        if not val:
            return None
        if isinstance(val, str):
            try:
                from datetime import date, datetime
                if 'T' in val:
                    return datetime.fromisoformat(val).date()
                return date.fromisoformat(val)
            except Exception:
                return None
        return val

    @staticmethod
    def get_assignments(teacher, filters=None):
        """
        Get assignments owned by the teacher with filtering and calculated stats.
        Supports filtering by classroom_id, student_id, status, content_type, time_filter ('active' | 'previous'), search.
        """
        filters = filters or {}
        queryset = ClassAssignment.objects.filter(teacher=teacher).select_related('classroom', 'story', 'quiz', 'lesson')

        # Filter by classroom
        classroom_id = filters.get('classroom_id')
        if classroom_id:
            queryset = queryset.filter(classroom_id=classroom_id)

        # Filter by student recipient
        student_id = filters.get('student_id')
        if student_id:
            queryset = queryset.filter(target_students__child_id=student_id).distinct()

        # Filter by status
        status_filter = filters.get('status')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)

        # Filter by content type
        content_type = filters.get('content_type')
        if content_type and content_type != 'all':
            queryset = queryset.filter(assignment_type=content_type)
            
        # Search by title
        search = filters.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)

        # Time filter: active (due date >= today or none) vs previous (due date < today)
        time_filter = filters.get('time_filter')
        now_date = timezone.localdate()
        if time_filter == 'active':
            queryset = queryset.filter(Q(due_date__gte=now_date) | Q(due_date__isnull=True))
        elif time_filter == 'previous':
            queryset = queryset.filter(due_date__lt=now_date)

        # Ordering
        order_by = filters.get('sort', '-created_at')
        if order_by in ['created_at', '-created_at', 'due_date', '-due_date', 'title']:
            queryset = queryset.order_by(order_by)
        else:
            queryset = queryset.order_by('-created_at')

        # Annotate/attach stats to each assignment
        assignments_list = list(queryset)
        for assignment in assignments_list:
            assignment.annotated_stats = TeacherAssignmentService.get_assignment_stats(assignment)

        return assignments_list

    @staticmethod
    def get_assignment(teacher, assignment_id):
        """Fetch single assignment with permissions check and attached stats."""
        try:
            assignment = ClassAssignment.objects.select_related('classroom', 'story', 'quiz', 'lesson').get(
                id=assignment_id, teacher=teacher
            )
            assignment.annotated_stats = TeacherAssignmentService.get_assignment_stats(assignment)
            return assignment
        except ClassAssignment.DoesNotExist:
            raise DjangoValidationError("Assignment not found or access denied.")

    @staticmethod
    @transaction.atomic
    def create_assignment(teacher, data):
        """
        Create a new assignment and assign to entire classroom or selected students.
        """
        classroom_id = data.get('classroom_id')
        title = data.get('title')
        assignment_type = data.get('content_type') or data.get('assignment_type', 'story')
        content_id = data.get('content_id') or data.get('story_id')
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
            if content_id:
                try:
                    story = Story.objects.get(id=content_id)
                except Story.DoesNotExist:
                    raise DjangoValidationError("Story not found.")
        elif assignment_type == 'quiz':
            if content_id:
                try:
                    quiz = Quiz.objects.get(id=content_id)
                except Quiz.DoesNotExist:
                    raise DjangoValidationError("Quiz not found.")
        elif assignment_type == 'lesson':
            if content_id:
                try:
                    lesson = Lesson.objects.get(id=content_id)
                except Lesson.DoesNotExist:
                    raise DjangoValidationError("Lesson not found.")

        # Dates
        due_date = TeacherAssignmentService._parse_date(data.get('due_date'))
        start_date = TeacherAssignmentService._parse_date(data.get('start_date')) or timezone.localdate()
        
        assignment = ClassAssignment.objects.create(
            teacher=teacher,
            classroom=classroom,
            title=title.strip(),
            description=data.get('description', ''),
            assignment_type=assignment_type,
            story=story,
            quiz=quiz,
            lesson=lesson,
            instructions=data.get('instructions', ''),
            reading_level=data.get('reading_level', 'Beginner'),
            start_date=start_date,
            due_date=due_date,
            status='active',  # Directly active when created by teacher
            target_all_students=(target_type == 'classroom')
        )
        
        # Publish and assign recipients
        TeacherAssignmentService._publish(assignment, target_type, student_ids)
        assignment.annotated_stats = TeacherAssignmentService.get_assignment_stats(assignment)
        return assignment

    @staticmethod
    @transaction.atomic
    def update_assignment(teacher, assignment_id, data):
        assignment = TeacherAssignmentService.get_assignment(teacher, assignment_id)
        
        if assignment.status not in ['draft', 'active', 'scheduled']:
            raise DjangoValidationError(f"Cannot edit assignment in {assignment.status} state.")
            
        if 'title' in data:
            assignment.title = data['title'].strip()
        if 'description' in data:
            assignment.description = data['description']
        if 'instructions' in data:
            assignment.instructions = data['instructions']
        if 'due_date' in data:
            assignment.due_date = data['due_date']
        if 'start_date' in data:
            assignment.start_date = data['start_date']
        if 'reading_level' in data:
            assignment.reading_level = data['reading_level']
            
        assignment.save()
        
        if 'student_ids' in data or 'target_type' in data:
            target_type = data.get('target_type', 'classroom' if assignment.target_all_students else 'student')
            student_ids = data.get('student_ids', [])
            TeacherAssignmentService._publish(assignment, target_type, student_ids)
            
        assignment.annotated_stats = TeacherAssignmentService.get_assignment_stats(assignment)
        return assignment

    @staticmethod
    @transaction.atomic
    def publish_assignment(teacher, assignment_id, target_type=None, student_ids=None):
        assignment = TeacherAssignmentService.get_assignment(teacher, assignment_id)
        if target_type is None:
            target_type = 'classroom' if assignment.target_all_students else 'student'
            
        published = TeacherAssignmentService._publish(assignment, target_type, student_ids)
        published.annotated_stats = TeacherAssignmentService.get_assignment_stats(published)
        return published

    @staticmethod
    def _publish(assignment, target_type, student_ids=None):
        """Helper to synchronize assignment recipients."""
        students_to_assign = []
        if target_type == 'classroom':
            assignment.target_all_students = True
            enrollments = ClassStudent.objects.filter(classroom=assignment.classroom, status='active').select_related('child')
            students_to_assign = [e.child for e in enrollments]
        else:
            assignment.target_all_students = False
            if not student_ids:
                raise DjangoValidationError("No students provided for targeted assignment.")
            enrollments = ClassStudent.objects.filter(classroom=assignment.classroom, child_id__in=student_ids, status='active').select_related('child')
            students_to_assign = [e.child for e in enrollments]
            if len(students_to_assign) != len(student_ids):
                raise DjangoValidationError("One or more selected students are not active in this classroom.")
                
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
        assignment.annotated_stats = TeacherAssignmentService.get_assignment_stats(assignment)
        return assignment

    @staticmethod
    @transaction.atomic
    def duplicate_assignment(teacher, assignment_id):
        original = TeacherAssignmentService.get_assignment(teacher, assignment_id)
        
        new_assignment = ClassAssignment.objects.create(
            teacher=original.teacher,
            classroom=original.classroom,
            title=f"{original.title} (Copy)",
            description=original.description,
            assignment_type=original.assignment_type,
            story=original.story,
            quiz=original.quiz,
            lesson=original.lesson,
            instructions=original.instructions,
            reading_level=original.reading_level,
            target_all_students=original.target_all_students,
            due_date=original.due_date,
            start_date=timezone.localdate(),
            status='active'
        )
        # Copy recipients
        enrollments = ClassAssignmentStudent.objects.filter(assignment=original)
        new_recipients = [
            ClassAssignmentStudent(assignment=new_assignment, child=r.child, status='assigned')
            for r in enrollments
        ]
        if new_recipients:
            ClassAssignmentStudent.objects.bulk_create(new_recipients)
            
        new_assignment.annotated_stats = TeacherAssignmentService.get_assignment_stats(new_assignment)
        return new_assignment

    @staticmethod
    def get_assignment_stats(assignment):
        """
        Calculate data-driven recipient progress stats.
        Handles zero recipients gracefully.
        """
        recipients = ClassAssignmentStudent.objects.filter(assignment=assignment)
        total = recipients.count()
        completed = recipients.filter(status__in=['submitted', 'reviewed', 'completed']).count()
        in_progress = recipients.filter(status='in_progress').count()
        not_started = recipients.filter(status='assigned').count()
        
        now_date = timezone.localdate()
        due_d = TeacherAssignmentService._parse_date(assignment.due_date)
        is_past_due = bool(due_d and due_d < now_date)
        overdue = recipients.filter(status='assigned').count() + in_progress if is_past_due else 0
        pending = max(0, total - completed)

        completion_pct = int(round((completed / total) * 100)) if total > 0 else 0
        
        return {
            'assigned': total,
            'completed': completed,
            'pending': pending,
            'in_progress': in_progress,
            'not_started': not_started,
            'overdue': overdue,
            'completion_percentage': completion_pct,
            'is_active': not is_past_due,
            'is_overdue': is_past_due and (completed < total)
        }
        
    @staticmethod
    def get_recipients(teacher, assignment_id, status_filter=None, search=None):
        """
        Return recipient student list with individual calculated status (completed, in_progress, not_started, overdue).
        """
        assignment = TeacherAssignmentService.get_assignment(teacher, assignment_id)
        qs = ClassAssignmentStudent.objects.filter(assignment=assignment).select_related('child')
        
        if search:
            qs = qs.filter(child__name__icontains=search)

        now_date = timezone.localdate()
        due_d = TeacherAssignmentService._parse_date(assignment.due_date)
        is_past_due = bool(due_d and due_d < now_date)
        
        results = []
        for r in qs:
            child = r.child
            avatar_str = child.avatar or '🦁'
            avatar_url = avatar_str if (avatar_str.startswith('http') or '/' in avatar_str) else f"https://api.dicebear.com/7.x/fun-emoji/svg?seed={child.name}"

            # Calculate individual effective status
            is_completed = r.status in ['submitted', 'reviewed', 'completed']
            if is_completed:
                eff_status = 'completed'
                is_overdue = False
            elif is_past_due:
                eff_status = 'overdue'
                is_overdue = True
            elif r.status == 'in_progress':
                eff_status = 'in_progress'
                is_overdue = False
            else:
                eff_status = 'not_started'
                is_overdue = False

            if status_filter and status_filter != 'all':
                if status_filter != eff_status:
                    continue

            results.append({
                'id': child.id,
                'name': child.name,
                'avatar': avatar_str,
                'avatar_url': avatar_url,
                'grade': child.grade_level,
                'status': eff_status,
                'raw_status': r.status,
                'is_overdue': is_overdue,
                'completion_percentage': r.completion_percentage if r.completion_percentage is not None else (100 if is_completed else 0),
                'score': r.score,
                'feedback': r.feedback,
                'started_at': r.started_at,
                'submitted_at': r.submitted_at,
                'completed_at': r.completed_at,
                'reviewed_at': r.reviewed_at
            })
            
        return results

    @staticmethod
    def get_student_assignments(teacher, student_id, classroom_id=None):
        """
        Get all assignments for a specific student belonging to the teacher's classroom(s).
        Returns categorized active, completed, overdue, upcoming assignments with summary stats.
        """
        # Permission check: student must be enrolled in a classroom taught by teacher
        membership_qs = ClassStudent.objects.filter(classroom__teacher=teacher, child_id=student_id, status='active')
        if classroom_id:
            membership_qs = membership_qs.filter(classroom_id=classroom_id)
            
        if not membership_qs.exists():
            raise PermissionDenied("Student is not enrolled in your authorized classroom(s).")
            
        recipient_records = ClassAssignmentStudent.objects.filter(
            child_id=student_id,
            assignment__classroom__teacher=teacher
        ).select_related('assignment', 'assignment__classroom', 'assignment__story', 'assignment__quiz', 'assignment__lesson').order_by('-assignment__created_at')

        if classroom_id:
            recipient_records = recipient_records.filter(assignment__classroom_id=classroom_id)

        now_date = timezone.localdate()
        
        active_list = []
        completed_list = []
        overdue_list = []
        upcoming_list = []
        all_list = []

        for r in recipient_records:
            a = r.assignment
            is_completed = r.status in ['submitted', 'reviewed', 'completed']
            due_d = TeacherAssignmentService._parse_date(a.due_date)
            start_d = TeacherAssignmentService._parse_date(a.start_date)
            is_past_due = bool(due_d and due_d < now_date)
            is_future_start = bool(start_d and start_d > now_date)

            if is_completed:
                eff_status = 'completed'
            elif is_past_due:
                eff_status = 'overdue'
            elif r.status == 'in_progress':
                eff_status = 'in_progress'
            else:
                eff_status = 'not_started'

            item = {
                'id': a.id,
                'title': a.title or (a.story.title_en if a.story else "Learning Task"),
                'description': a.description,
                'assignment_type': a.assignment_type,
                'type': a.assignment_type,
                'classroom_id': a.classroom.id,
                'classroom_name': a.classroom.name,
                'due_date': a.due_date,
                'start_date': a.start_date,
                'status': eff_status,
                'raw_status': r.status,
                'is_overdue': not is_completed and is_past_due,
                'score': r.score,
                'completion_percentage': r.completion_percentage if r.completion_percentage is not None else (100 if is_completed else 0),
                'completed_at': r.completed_at or r.submitted_at,
                'created_at': a.created_at
            }

            all_list.append(item)
            if is_completed:
                completed_list.append(item)
            elif is_past_due:
                overdue_list.append(item)
            elif is_future_start:
                upcoming_list.append(item)
            else:
                active_list.append(item)

        total = len(all_list)
        comp_count = len(completed_list)
        active_count = len(active_list)
        overdue_count = len(overdue_list)
        upcoming_count = len(upcoming_list)

        return {
            'student_id': student_id,
            'stats': {
                'total': total,
                'active': active_count,
                'completed': comp_count,
                'overdue': overdue_count,
                'upcoming': upcoming_count,
                'completion_percentage': int(round((comp_count / total) * 100)) if total > 0 else 0
            },
            'active': active_list,
            'completed': completed_list,
            'overdue': overdue_list,
            'upcoming': upcoming_list,
            'all': all_list
        }
