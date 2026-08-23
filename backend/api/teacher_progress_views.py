from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.exceptions import PermissionDenied
from django.http import HttpResponse
from api.models import User
from .services.teacher_progress_service import TeacherProgressService
from .teacher_progress_serializers import (
    TeacherProgressOverviewSerializer,
    ReadingAnalyticsSerializer,
    QuizAnalyticsSerializer,
    AssignmentAnalyticsSerializer,
    NeedsAttentionItemSerializer,
    StudentProgressSummarySerializer
)

class BaseTeacherProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def check_teacher_permission(self, request):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to access teacher progress analytics.")


class TeacherProgressOverviewView(BaseTeacherProgressView):
    def get(self, request):
        self.check_teacher_permission(request)
        classroom_id = request.query_params.get('classroom_id')
        time_period = request.query_params.get('time_period', 'all')

        overview = TeacherProgressService.get_overview(request.user, classroom_id, time_period)
        serializer = TeacherProgressOverviewSerializer(overview)
        return Response(serializer.data)


class TeacherReadingAnalyticsView(BaseTeacherProgressView):
    def get(self, request):
        self.check_teacher_permission(request)
        classroom_id = request.query_params.get('classroom_id')
        time_period = request.query_params.get('time_period', 'all')

        analytics = TeacherProgressService.get_reading_analytics(request.user, classroom_id, time_period)
        serializer = ReadingAnalyticsSerializer(analytics)
        return Response(serializer.data)


class TeacherQuizAnalyticsView(BaseTeacherProgressView):
    def get(self, request):
        self.check_teacher_permission(request)
        classroom_id = request.query_params.get('classroom_id')
        time_period = request.query_params.get('time_period', 'all')

        analytics = TeacherProgressService.get_quiz_analytics(request.user, classroom_id, time_period)
        serializer = QuizAnalyticsSerializer(analytics)
        return Response(serializer.data)


class TeacherAssignmentAnalyticsView(BaseTeacherProgressView):
    def get(self, request):
        self.check_teacher_permission(request)
        classroom_id = request.query_params.get('classroom_id')
        time_period = request.query_params.get('time_period', 'all')

        analytics = TeacherProgressService.get_assignment_analytics(request.user, classroom_id, time_period)
        serializer = AssignmentAnalyticsSerializer(analytics)
        return Response(serializer.data)


class TeacherNeedsAttentionView(BaseTeacherProgressView):
    def get(self, request):
        self.check_teacher_permission(request)
        classroom_id = request.query_params.get('classroom_id')

        items = TeacherProgressService.get_needs_attention(request.user, classroom_id)
        serializer = NeedsAttentionItemSerializer(items, many=True)
        return Response(serializer.data)


class TeacherStudentProgressListView(BaseTeacherProgressView):
    def get(self, request):
        self.check_teacher_permission(request)
        classroom_id = request.query_params.get('classroom_id')
        search = request.query_params.get('search', '')
        sort_by = request.query_params.get('sort_by', 'progress')
        time_period = request.query_params.get('time_period', 'all')

        students = TeacherProgressService.get_student_performance_list(
            request.user, classroom_id, search, sort_by, time_period
        )
        serializer = StudentProgressSummarySerializer(students, many=True)
        return Response({'results': serializer.data})


class TeacherStudentProgressDetailView(BaseTeacherProgressView):
    def get(self, request, student_id):
        self.check_teacher_permission(request)
        time_period = request.query_params.get('time_period', 'all')

        try:
            detail = TeacherProgressService.get_student_detail_progress(request.user, student_id, time_period)
            return Response(detail)
        except PermissionDenied as e:
            return Response({'error': {'message': str(e)}}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'error': {'message': str(e)}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TeacherProgressExportView(BaseTeacherProgressView):
    def get(self, request):
        self.check_teacher_permission(request)
        classroom_id = request.query_params.get('classroom_id')

        csv_data = TeacherProgressService.export_progress_report_csv(request.user, classroom_id)
        response = HttpResponse(csv_data, content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="teacher_progress_report.csv"'
        return response
