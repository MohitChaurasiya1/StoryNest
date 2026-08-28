import csv
import io
from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg, Count, Sum, Q, Max, Min
from django.core.exceptions import PermissionDenied, ValidationError
from api.models import (
    TeacherClass, ClassStudent, ChildProfile, ReadingLog,
    ReadingProgress, QuizAttempt, ClassAssignment, ClassAssignmentStudent, Story
)

class TeacherProgressService:
    @staticmethod
    def get_teacher_classrooms(teacher):
        """Return QuerySet of active & archived classrooms owned by teacher."""
        return TeacherClass.objects.filter(teacher=teacher)

    @staticmethod
    def get_teacher_student_ids(teacher, classroom_id=None):
        """Return set/QuerySet of child IDs belonging to teacher's classroom(s)."""
        enrollments = ClassStudent.objects.filter(classroom__teacher=teacher, status='active')
        if classroom_id:
            enrollments = enrollments.filter(classroom_id=classroom_id)
        return enrollments.values_list('child_id', flat=True).distinct()

    @staticmethod
    def get_date_cutoff(time_period):
        """Calculate start datetime based on time period filter."""
        now = timezone.now()
        if time_period == 'today':
            return now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif time_period == 'week':
            return now - timedelta(days=7)
        elif time_period == 'month':
            return now - timedelta(days=30)
        elif time_period == 'term':
            return now - timedelta(days=90)
        return None  # 'all'

    @classmethod
    def calculate_student_metrics(cls, child, teacher, classroom_id=None, time_period='all', cutoff=None):
        """
        Calculate unified, pure database-driven learning metrics, progress, and risk status for a single student.
        
        Rules:
        - Missing data is NOT punished (e.g. no quizzes => quiz_avg=None, does not trigger at_risk).
        - Assignment completion = (completed / total) * 100 if total > 0 else None.
        - Overall progress = average of available component percentages (assignments, reading, quizzes).
        - Status = 'on_track' (🟢), 'needs_attention' (🟡), or 'at_risk' (🔴).
        - Reasons list documents exactly why a student is marked needs_attention or at_risk.
        """
        if cutoff is None:
            cutoff = cls.get_date_cutoff(time_period)
        now = timezone.now()

        # 1. Assignment Metrics
        asgn_qs = ClassAssignmentStudent.objects.filter(child=child, assignment__classroom__teacher=teacher)
        if classroom_id:
            asgn_qs = asgn_qs.filter(assignment__classroom_id=classroom_id)
        if cutoff:
            asgn_qs = asgn_qs.filter(assignment__created_at__gte=cutoff)

        total_asgn = asgn_qs.count()
        comp_asgn = asgn_qs.filter(status__in=['completed', 'submitted', 'reviewed']).count()
        in_progress_asgn = asgn_qs.filter(status='in_progress').count()
        not_started_asgn = asgn_qs.filter(status='assigned').count()
        overdue_asgn = asgn_qs.filter(
            assignment__due_date__lt=now
        ).exclude(status__in=['completed', 'submitted', 'reviewed']).count()

        assignment_completion = int(round((comp_asgn / total_asgn) * 100)) if total_asgn > 0 else None
        assignment_score_avg = asgn_qs.filter(score__isnull=False).aggregate(avg=Avg('score'))['avg']
        assignment_avg_score = int(round(assignment_score_avg)) if assignment_score_avg is not None else None

        # 2. Reading Metrics
        logs_qs = ReadingLog.objects.filter(child=child)
        prog_qs = ReadingProgress.objects.filter(child=child)
        if cutoff:
            logs_qs = logs_qs.filter(created_at__gte=cutoff)
            prog_qs = prog_qs.filter(updated_at__gte=cutoff)

        completed_logs = logs_qs.filter(completed=True).count()
        total_logs = logs_qs.count()
        reading_minutes = logs_qs.aggregate(tot=Sum('reading_time_minutes'))['tot'] or 0
        avg_session = int(round(logs_qs.aggregate(avg=Avg('reading_time_minutes'))['avg'] or 0))

        # Reading progress percentage
        if prog_qs.exists():
            avg_read_prog = int(round(prog_qs.aggregate(avg=Avg('completion_percentage'))['avg'] or 0))
        elif total_logs > 0:
            avg_read_prog = int(round((completed_logs / total_logs) * 100))
        else:
            avg_read_prog = None

        # Inactivity calculation
        last_log = ReadingLog.objects.filter(child=child).order_by('-read_date', '-created_at').first()
        if last_log and last_log.read_date:
            days_inactive = (timezone.localdate() - last_log.read_date).days
        elif last_log and last_log.created_at:
            days_inactive = (timezone.now().date() - last_log.created_at.date()).days
        else:
            days_inactive = None

        # 3. Quiz Metrics
        quiz_qs = QuizAttempt.objects.filter(child=child)
        if cutoff:
            quiz_qs = quiz_qs.filter(attempted_at__gte=cutoff)

        quizzes_count = quiz_qs.count()
        if quizzes_count > 0:
            avg_quiz = int(round(quiz_qs.aggregate(avg=Avg('percentage'))['avg'] or 0))
            highest_quiz = int(round(quiz_qs.aggregate(m=Max('percentage'))['m'] or 0))
            lowest_quiz = int(round(quiz_qs.aggregate(m=Min('percentage'))['m'] or 0))
        else:
            avg_quiz = None
            highest_quiz = None
            lowest_quiz = None

        # 4. Overall Progress Calculation (Composite of available data points)
        components = []
        if assignment_completion is not None:
            components.append(assignment_completion)
        if avg_read_prog is not None:
            components.append(avg_read_prog)
        if avg_quiz is not None:
            components.append(avg_quiz)

        if len(components) > 0:
            overall_progress = int(round(sum(components) / len(components)))
        else:
            overall_progress = None

        # 5. Risk Score & Reasons Evaluation
        risk_score = 0
        reasons = []

        # A. Overdue assignments
        if overdue_asgn >= 2:
            risk_score += 35
            reasons.append(f"{overdue_asgn} assignments overdue")
        elif overdue_asgn == 1:
            risk_score += 15
            reasons.append("1 assignment overdue")

        # B. Low assignment completion (only when assignments were assigned)
        if total_asgn > 0 and assignment_completion is not None:
            if assignment_completion < 50:
                risk_score += 30
                reasons.append(f"Assignment completion is {assignment_completion}% ({comp_asgn} of {total_asgn} completed)")
            elif assignment_completion < 75:
                risk_score += 15
                reasons.append(f"Assignment completion is {assignment_completion}%")

        # C. Reading inactivity (only if learner has reading history or assignments)
        if days_inactive is not None:
            if days_inactive >= 7:
                risk_score += 30
                reasons.append(f"No reading activity for {days_inactive} days")
            elif days_inactive >= 4:
                risk_score += 15
                reasons.append(f"No reading activity for {days_inactive} days")

        # D. Quiz performance (only when quizzes were taken)
        if quizzes_count > 0 and avg_quiz is not None:
            if avg_quiz < 55:
                risk_score += 30
                reasons.append(f"Quiz average below 55% ({avg_quiz}%)")
            elif avg_quiz < 70:
                risk_score += 15
                reasons.append(f"Quiz average moderate ({avg_quiz}%)")

        # Status Mapping
        if risk_score >= 45:
            status = 'at_risk'
        elif risk_score >= 20:
            status = 'needs_attention'
        else:
            status = 'on_track'

        # Classroom Info
        enrollment_qs = ClassStudent.objects.filter(child=child, classroom__teacher=teacher)
        if classroom_id:
            enrollment_qs = enrollment_qs.filter(classroom_id=classroom_id)
        enrollment = enrollment_qs.select_related('classroom').first()
        classroom_name = enrollment.classroom.name if enrollment else "Classroom"

        return {
            'child_id': child.id,
            'name': child.name,
            'avatar': child.avatar,
            'classroom_name': classroom_name,
            'overall_progress': overall_progress,
            'assignment_completion': assignment_completion,
            'total_assignments': total_asgn,
            'completed_assignments': comp_asgn,
            'in_progress_assignments': in_progress_asgn,
            'not_started_assignments': not_started_asgn,
            'overdue_assignments': overdue_asgn,
            'assignment_avg_score': assignment_avg_score,
            'reading_completion': avg_read_prog,
            'stories_completed': completed_logs,
            'reading_minutes': reading_minutes,
            'average_session_minutes': avg_session,
            'days_inactive': days_inactive,
            'quiz_average': avg_quiz,
            'quizzes_completed': quizzes_count,
            'highest_quiz_score': highest_quiz,
            'lowest_quiz_score': lowest_quiz,
            'risk_score': risk_score,
            'status': status,
            'reasons': reasons
        }

    @classmethod
    def get_overview(cls, teacher, classroom_id=None, time_period='all'):
        """Calculate high-level summary stats for teacher dashboard/progress page."""
        student_ids = list(cls.get_teacher_student_ids(teacher, classroom_id))
        total_students = len(student_ids)

        if total_students == 0:
            return {
                'total_students': 0,
                'average_progress': None,
                'quiz_average': None,
                'assignment_completion': None,
                'active_readers': 0
            }

        cutoff = cls.get_date_cutoff(time_period)
        children = ChildProfile.objects.filter(id__in=student_ids)

        progress_list = []
        quiz_list = []
        assignment_list = []

        for child in children:
            m = cls.calculate_student_metrics(child, teacher, classroom_id=classroom_id, cutoff=cutoff)
            if m['overall_progress'] is not None:
                progress_list.append(m['overall_progress'])
            if m['quiz_average'] is not None:
                quiz_list.append(m['quiz_average'])
            if m['assignment_completion'] is not None:
                assignment_list.append(m['assignment_completion'])

        avg_progress = int(round(sum(progress_list) / len(progress_list))) if progress_list else None
        avg_quiz = int(round(sum(quiz_list) / len(quiz_list))) if quiz_list else None
        avg_asgn = int(round(sum(assignment_list) / len(assignment_list))) if assignment_list else None

        # Active readers in last 7 days
        active_cutoff = timezone.now() - timedelta(days=7)
        active_readers = ReadingLog.objects.filter(
            child_id__in=student_ids,
            created_at__gte=active_cutoff
        ).values('child_id').distinct().count()

        return {
            'total_students': total_students,
            'average_progress': avg_progress if avg_progress is not None else 0,
            'quiz_average': avg_quiz if avg_quiz is not None else 0,
            'assignment_completion': avg_asgn if avg_asgn is not None else 0,
            'active_readers': active_readers
        }

    @classmethod
    def get_reading_analytics(cls, teacher, classroom_id=None, time_period='all'):
        """Calculate detailed reading metrics and daily trend from real data."""
        student_ids = list(cls.get_teacher_student_ids(teacher, classroom_id))
        cutoff = cls.get_date_cutoff(time_period)

        logs = ReadingLog.objects.filter(child_id__in=student_ids)
        progress = ReadingProgress.objects.filter(child_id__in=student_ids)

        if cutoff:
            logs = logs.filter(created_at__gte=cutoff)
            progress = progress.filter(updated_at__gte=cutoff)

        stories_started = progress.count()
        stories_completed = logs.filter(completed=True).count()
        reading_minutes = logs.aggregate(total=Sum('reading_time_minutes'))['total'] or 0
        avg_session = int(round(logs.aggregate(avg=Avg('reading_time_minutes'))['avg'] or 0))

        # Calculate average streak across all active children from real streak models
        from api.parent_views import calculate_streak_for_child
        active_children = ChildProfile.objects.filter(id__in=student_ids)
        streaks = [calculate_streak_for_child(c) for c in active_children]
        avg_streak = int(round(sum(streaks) / len(streaks))) if streaks else 0

        # Daily trend for the last 7 days
        trend_days = 7
        now = timezone.localdate()
        trend = []
        for i in range(trend_days - 1, -1, -1):
            day_date = now - timedelta(days=i)
            day_logs = ReadingLog.objects.filter(child_id__in=student_ids, read_date=day_date)
            day_mins = day_logs.aggregate(tot=Sum('reading_time_minutes'))['tot'] or 0
            trend.append({
                'date': day_date.strftime('%b %d'),
                'progress': int(round(day_mins))
            })

        return {
            'stories_started': stories_started,
            'stories_completed': stories_completed,
            'reading_minutes': reading_minutes,
            'average_session_minutes': avg_session,
            'average_streak': avg_streak,
            'trend': trend
        }

    @classmethod
    def get_quiz_analytics(cls, teacher, classroom_id=None, time_period='all'):
        """Calculate quiz scores and score distribution from real quiz attempts."""
        student_ids = list(cls.get_teacher_student_ids(teacher, classroom_id))
        cutoff = cls.get_date_cutoff(time_period)

        attempts = QuizAttempt.objects.filter(child_id__in=student_ids)
        if cutoff:
            attempts = attempts.filter(attempted_at__gte=cutoff)

        completed_count = attempts.count()
        if completed_count == 0:
            return {
                'average_score': 0,
                'highest_score': 0,
                'lowest_score': 0,
                'completed': 0,
                'distribution': {'score_90_100': 0, 'score_80_89': 0, 'score_70_79': 0, 'below_70': 0}
            }

        avg_score = attempts.aggregate(avg=Avg('percentage'))['avg'] or 0
        highest = attempts.aggregate(max_score=Max('percentage'))['max_score'] or 0
        lowest = attempts.aggregate(min_score=Min('percentage'))['min_score'] or 0

        dist = {
            'score_90_100': attempts.filter(percentage__gte=90).count(),
            'score_80_89': attempts.filter(percentage__gte=80, percentage__lt=90).count(),
            'score_70_79': attempts.filter(percentage__gte=70, percentage__lt=80).count(),
            'below_70': attempts.filter(percentage__lt=70).count()
        }

        return {
            'average_score': int(round(avg_score)),
            'highest_score': int(round(highest)),
            'lowest_score': int(round(lowest)),
            'completed': completed_count,
            'distribution': dist
        }

    @classmethod
    def get_assignment_analytics(cls, teacher, classroom_id=None, time_period='all'):
        """Calculate assignment completion breakdown from real database records."""
        student_ids = list(cls.get_teacher_student_ids(teacher, classroom_id))
        cutoff = cls.get_date_cutoff(time_period)

        asgns = ClassAssignmentStudent.objects.filter(
            assignment__classroom__teacher=teacher,
            child_id__in=student_ids
        )
        if classroom_id:
            asgns = asgns.filter(assignment__classroom_id=classroom_id)
        if cutoff:
            asgns = asgns.filter(assignment__created_at__gte=cutoff)

        total = asgns.count()
        completed = asgns.filter(status__in=['completed', 'submitted', 'reviewed']).count()
        in_progress = asgns.filter(status='in_progress').count()
        not_started = asgns.filter(status='assigned').count()
        
        now = timezone.now()
        overdue = asgns.filter(
            assignment__due_date__lt=now
        ).exclude(status__in=['completed', 'submitted', 'reviewed']).count()

        completion_pct = int(round((completed / total) * 100)) if total > 0 else 0

        return {
            'assigned': total,
            'completed': completed,
            'in_progress': in_progress,
            'not_started': not_started,
            'overdue': overdue,
            'completion_percentage': completion_pct
        }

    @classmethod
    def get_needs_attention(cls, teacher, classroom_id=None):
        """
        Evaluate real attention needs across enrolled students using unified risk metrics.
        """
        student_ids = list(cls.get_teacher_student_ids(teacher, classroom_id))
        children = ChildProfile.objects.filter(id__in=student_ids)

        attention_items = []
        for child in children:
            m = cls.calculate_student_metrics(child, teacher, classroom_id=classroom_id)
            if m['status'] in ['at_risk', 'needs_attention'] and len(m['reasons']) > 0:
                severity = 'HIGH' if m['status'] == 'at_risk' else 'MEDIUM'
                attention_items.append({
                    'student_id': child.id,
                    'student_name': child.name,
                    'avatar': child.avatar,
                    'classroom_name': m['classroom_name'],
                    'severity': severity,
                    'reasons': m['reasons']
                })

        severity_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
        attention_items.sort(key=lambda x: severity_order.get(x['severity'], 3))
        return attention_items

    @classmethod
    def get_student_performance_list(cls, teacher, classroom_id=None, search='', sort_by='progress', time_period='all'):
        """Return list of student performance summaries calculated purely from real data."""
        student_ids = list(cls.get_teacher_student_ids(teacher, classroom_id))
        students_qs = ChildProfile.objects.filter(id__in=student_ids)

        if search:
            students_qs = students_qs.filter(name__icontains=search)

        cutoff = cls.get_date_cutoff(time_period)
        results = []

        for child in students_qs:
            m = cls.calculate_student_metrics(child, teacher, classroom_id=classroom_id, cutoff=cutoff)
            results.append({
                'id': child.id,
                'name': child.name,
                'avatar': child.avatar,
                'classroom_name': m['classroom_name'],
                'progress': m['overall_progress'] if m['overall_progress'] is not None else 0,
                'quiz_avg': m['quiz_average'] if m['quiz_average'] is not None else 0,
                'assignment_completion': m['assignment_completion'] if m['assignment_completion'] is not None else 0,
                'status': m['status'],
                'risk_score': m['risk_score'],
                'reasons': m['reasons']
            })

        if sort_by == 'quiz_score':
            results.sort(key=lambda x: x['quiz_avg'], reverse=True)
        elif sort_by == 'assignment_completion':
            results.sort(key=lambda x: x['assignment_completion'], reverse=True)
        elif sort_by == 'name':
            results.sort(key=lambda x: x['name'])
        else: # progress descending
            results.sort(key=lambda x: x['progress'], reverse=True)

        return results

    @classmethod
    def get_student_detail_progress(cls, teacher, student_id, time_period='all'):
        """Return comprehensive analytics for an individual student using unified calculations."""
        enrollment = ClassStudent.objects.filter(child_id=student_id, classroom__teacher=teacher).first()
        if not enrollment:
            raise PermissionDenied("You do not have permission to view this student's progress.")

        child = enrollment.child
        cutoff = cls.get_date_cutoff(time_period)
        m = cls.calculate_student_metrics(child, teacher, cutoff=cutoff)

        from api.parent_views import calculate_streak_for_child
        real_streak = calculate_streak_for_child(child)
        try:
            longest_streak = max(real_streak, child.streak.longest_streak) if hasattr(child, 'streak') else real_streak
        except Exception:
            longest_streak = real_streak

        reading_details = {
            'stories_completed': m['stories_completed'],
            'reading_minutes': m['reading_minutes'],
            'current_streak': real_streak,
            'longest_streak': longest_streak,
            'average_session': m['average_session_minutes']
        }

        quiz_details = {
            'average_score': m['quiz_average'] or 0,
            'quizzes_completed': m['quizzes_completed'],
            'highest_score': m['highest_quiz_score'] or 0,
            'lowest_score': m['lowest_quiz_score'] or 0
        }

        assignment_details = {
            'completed': m['completed_assignments'],
            'in_progress': m['in_progress_assignments'],
            'overdue': m['overdue_assignments'],
            'average_score': m['assignment_avg_score'] or 0
        }

        # Real Chronological Growth Trend (calculated from monthly completed activity)
        # Real Chronological Growth Trend (calculated from monthly completed activity)
        growth_trend = []
        now = timezone.localdate()
        from datetime import datetime
        for i in range(3, -1, -1):
            month_date = now - timedelta(days=i * 30)
            month_start = month_date.replace(day=1)
            next_month = (month_start + timedelta(days=32)).replace(day=1)
            dt_start = timezone.make_aware(datetime.combine(month_start, datetime.min.time()))
            dt_end = timezone.make_aware(datetime.combine(next_month, datetime.min.time()))

            month_logs = ReadingLog.objects.filter(child=child, read_date__gte=month_start, read_date__lt=next_month)
            month_asgns = ClassAssignmentStudent.objects.filter(
                child=child, 
                assignment__classroom__teacher=teacher,
                completed_at__gte=dt_start,
                completed_at__lt=dt_end
            )
            month_quizzes = QuizAttempt.objects.filter(child=child, attempted_at__gte=dt_start, attempted_at__lt=dt_end)

            month_scores = []
            if month_asgns.filter(status__in=['completed', 'submitted', 'reviewed']).exists():
                asgn_rate = (month_asgns.filter(status__in=['completed', 'submitted', 'reviewed']).count() / max(1, month_asgns.count())) * 100
                month_scores.append(asgn_rate)
            if month_quizzes.exists():
                month_scores.append(month_quizzes.aggregate(avg=Avg('percentage'))['avg'] or 0)
            if month_logs.exists():
                comp_rate = (month_logs.filter(completed=True).count() / max(1, month_logs.count())) * 100
                month_scores.append(comp_rate)

            month_progress = int(round(sum(month_scores) / len(month_scores))) if month_scores else (m['overall_progress'] or 0)
            growth_trend.append({
                'label': month_start.strftime('%b'),
                'progress': month_progress
            })

        # Recent Activity Timeline (top 5 real records)
        timeline = []
        for log in ReadingLog.objects.filter(child=child).order_by('-created_at')[:4]:
            timeline.append({
                'type': 'reading',
                'title': f"Read '{log.story_title or 'Story'}'",
                'timestamp': log.created_at.strftime('%b %d, %Y')
            })

        for attempt in QuizAttempt.objects.filter(child=child).order_by('-attempted_at')[:3]:
            quiz_title = attempt.quiz.title if attempt.quiz else 'Comprehension Quiz'
            timeline.append({
                'type': 'quiz',
                'title': f"Scored {int(round(attempt.percentage))}% on {quiz_title}",
                'timestamp': attempt.attempted_at.strftime('%b %d, %Y')
            })

        # Sort timeline by timestamp
        timeline = timeline[:5]

        return {
            'student': {
                'id': child.id,
                'name': child.name,
                'avatar': child.avatar,
                'classroom_name': enrollment.classroom.name
            },
            'overview': {
                'progress': m['overall_progress'] or 0,
                'quiz_average': m['quiz_average'] or 0,
                'assignment_completion': m['assignment_completion'] or 0
            },
            'risk': {
                'score': m['risk_score'],
                'status': m['status'],
                'reasons': m['reasons']
            },
            'growth_trend': growth_trend,
            'reading': reading_details,
            'quiz': quiz_details,
            'assignments': assignment_details,
            'timeline': timeline
        }

    @classmethod
    def export_progress_report_csv(cls, teacher, classroom_id=None):
        """Generate CSV string of student progress for export."""
        students = cls.get_student_performance_list(teacher, classroom_id)

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Student Name', 'Classroom', 'Overall Progress (%)', 'Quiz Average (%)', 'Assignment Completion (%)', 'Status', 'Risk Reasons'])

        for s in students:
            reasons_str = "; ".join(s.get('reasons', [])) if s.get('reasons') else "None"
            writer.writerow([
                s['name'],
                s['classroom_name'],
                s['progress'],
                s['quiz_avg'],
                s['assignment_completion'],
                s['status'].replace('_', ' ').title(),
                reasons_str
            ])

        return output.getvalue()
