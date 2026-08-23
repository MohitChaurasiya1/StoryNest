from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import User, ChildProfile
from .services.teacher_dashboard_service import TeacherDashboardService
from .services.teacher_classroom_service import TeacherClassroomService
from .teacher_v2_serializers import TeacherClassroomSerializer, ClassroomStudentSerializer, LibraryContentCardSerializer
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.pagination import PageNumberPagination
from .services.teacher_library_service import TeacherLibraryService


class TeacherDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Authorization: Verify user is a teacher
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to access the teacher dashboard.")

        # 2. Fetch Dashboard Data via Service
        try:
            dashboard_data = TeacherDashboardService.get_dashboard_data(request.user)
            return Response(dashboard_data)
        except Exception as e:
            # Consistent API Error Contract as specified
            return Response({
                "error": {
                    "code": "DASHBOARD_LOAD_FAILED",
                    "message": "Unable to load teacher dashboard.",
                    "details": str(e) # In production we might not expose str(e), but helpful for debugging
                }
            }, status=500)


class TeacherClassroomListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to access classrooms.")
            
        status_filter = request.query_params.get('status', 'active')
        classrooms = TeacherClassroomService.get_classrooms(request.user, status=status_filter)
        serializer = TeacherClassroomSerializer(classrooms, many=True)
        return Response({"results": serializer.data})

    def post(self, request):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to create classrooms.")
            
        try:
            classroom = TeacherClassroomService.create_classroom(request.user, request.data)
            serializer = TeacherClassroomSerializer(classroom)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=400)
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=500)


class TeacherClassroomDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, classroom_id):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to access classrooms.")
            
        try:
            classroom = TeacherClassroomService.get_classroom(request.user, classroom_id)
            serializer = TeacherClassroomSerializer(classroom)
            data = serializer.data
            
            # Add stats for overview
            stats = TeacherClassroomService.get_classroom_stats(classroom)
            data['stats'] = stats
            
            return Response(data)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=404)
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=500)

    def patch(self, request, classroom_id):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to edit classrooms.")
            
        try:
            classroom = TeacherClassroomService.update_classroom(request.user, classroom_id, request.data)
            serializer = TeacherClassroomSerializer(classroom)
            return Response(serializer.data)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=400)
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=500)

    def post(self, request, classroom_id):
        # Using POST /api/teacher/classrooms/<id>/archive/ normally, 
        # but if we route it here we can check the action.
        # Actually it's better to make a separate view or route it to a method.
        # We'll rely on a separate view for archive.
        pass


class TeacherClassroomArchiveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, classroom_id):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to archive classrooms.")
            
        try:
            classroom = TeacherClassroomService.archive_classroom(request.user, classroom_id)
            serializer = TeacherClassroomSerializer(classroom)
            return Response(serializer.data)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=404)
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=500)


class TeacherClassroomStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, classroom_id):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to access classrooms.")
            
        try:
            classroom = TeacherClassroomService.get_classroom(request.user, classroom_id)
            memberships = TeacherClassroomService.get_students(classroom)
            
            # Simple global search within the classroom if query parameter exists
            search_query = request.query_params.get('search', '')
            if search_query:
                memberships = memberships.filter(child__name__icontains=search_query)
                
            serializer = ClassroomStudentSerializer(memberships, many=True)
            return Response({"results": serializer.data})
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=404)
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=500)

    def post(self, request, classroom_id):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to add students.")
            
        student_ids = request.data.get('student_ids', [])
        try:
            added_count = TeacherClassroomService.add_students(request.user, classroom_id, student_ids)
            return Response({"message": f"{added_count} students added successfully."}, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=400)
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=500)


class TeacherClassroomStudentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, classroom_id, student_id):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to access classrooms.")
            
        try:
            summary = TeacherClassroomService.get_student_summary(request.user, classroom_id, student_id)
            return Response(summary)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=404)
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=500)

    def delete(self, request, classroom_id, student_id):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to remove students.")
            
        try:
            TeacherClassroomService.remove_student(request.user, classroom_id, student_id)
            return Response({"message": "Student removed successfully."}, status=status.HTTP_204_NO_CONTENT)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=400)
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=500)


class TeacherGlobalStudentSearchView(APIView):
    """
    Search endpoint for teachers to find students to add to their classroom.
    In a real system, this might be restricted to school/district.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to search students.")
            
        search_query = request.query_params.get('search', '').strip()
        if not search_query or len(search_query) < 2:
            return Response({"results": []})
            
        children = ChildProfile.objects.filter(name__icontains=search_query)[:20]
        
        results = [
            {
                "id": c.id,
                "name": c.name,
                "avatar_url": c.avatar_url
            } for c in children
        ]
        
        return Response({"results": results})


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class TeacherLibraryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to access the library.")
            
        filters = {
            'type': request.query_params.get('type', 'all'),
            'search': request.query_params.get('search', ''),
            'grade': request.query_params.get('grade', ''),
            'created_by_me': request.query_params.get('created_by_me', 'false')
        }
        
        try:
            results = TeacherLibraryService.get_library_feed(request.user, filters)
            
            # Simple python-level pagination since we aggregated lists
            paginator = StandardResultsSetPagination()
            
            # We must pass a queryset-like object to paginate_queryset, a list works in DRF's PageNumberPagination
            page = paginator.paginate_queryset(results, request, view=self)
            if page is not None:
                serializer = LibraryContentCardSerializer(page, many=True)
                return paginator.get_paginated_response(serializer.data)

            serializer = LibraryContentCardSerializer(results, many=True)
            return Response({"results": serializer.data})
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=500)


class TeacherLibraryPreviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, content_type, content_id):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to access library content.")
            
        try:
            if content_type == 'story':
                data = TeacherLibraryService.get_story_preview(request.user, content_id)
            elif content_type == 'lesson':
                data = TeacherLibraryService.get_lesson_preview(request.user, content_id)
            elif content_type == 'quiz':
                data = TeacherLibraryService.get_quiz_preview(request.user, content_id)
            else:
                return Response({"error": {"message": "Invalid content type."}}, status=400)
                
            return Response(data)
        except Exception as e:
            # We should probably return 404 for "not found", but generic 400 is fine for preview errors
            return Response({"error": {"message": str(e)}}, status=400)
