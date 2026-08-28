from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status

from api.models import User
from api.services.teacher_story_service import TeacherStoryService

class TeacherStoryGenerateView(APIView):
    """
    POST /api/teacher/stories/generate/
    Generates story content via Gemini AI without requiring direct child profile linking.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to generate teacher stories.")

        try:
            generated = TeacherStoryService.generate_story(request.user, request.data)
            return Response(generated, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=status.HTTP_400_BAD_REQUEST)


class TeacherStoryListCreateView(APIView):
    """
    POST /api/teacher/stories/
    Create a new teacher story (manual or from generated draft).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to create teacher stories.")

        try:
            story = TeacherStoryService.create_story(request.user, request.data)
            return Response(story, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=status.HTTP_400_BAD_REQUEST)


class TeacherStoryDetailView(APIView):
    """
    GET /api/teacher/stories/<id>/
    PATCH /api/teacher/stories/<id>/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, story_id):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to view this story.")

        try:
            story = TeacherStoryService.get_story(request.user, story_id)
            return Response(story, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            raise e
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, story_id):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to edit this story.")

        try:
            story = TeacherStoryService.update_story(request.user, story_id, request.data)
            return Response(story, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            raise e
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=status.HTTP_400_BAD_REQUEST)


class TeacherStoryPublishView(APIView):
    """
    POST /api/teacher/stories/<id>/publish/
    Publishes the story to My Library, Classroom, or Specific Students.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, story_id):
        if request.user.role not in [User.Role.TEACHER, User.Role.ADMIN]:
            raise PermissionDenied("You do not have permission to publish this story.")

        try:
            result = TeacherStoryService.publish_story(request.user, story_id, request.data)
            return Response(result, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"error": {"message": str(e.message) if hasattr(e, 'message') else str(e)}}, status=status.HTTP_400_BAD_REQUEST)
        except PermissionDenied as e:
            raise e
        except Exception as e:
            return Response({"error": {"message": str(e)}}, status=status.HTTP_400_BAD_REQUEST)
