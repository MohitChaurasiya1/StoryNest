from rest_framework import permissions
from .models import User

class IsParent(permissions.BasePermission):
    """
    Custom permission to allow access only to Parent users (or Admins/Staff).
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.Role.PARENT or request.user.is_staff or request.user.role == User.Role.ADMIN)
        )

class IsTeacher(permissions.BasePermission):
    """
    Custom permission to allow access only to Teacher users (or Admins/Staff).
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.Role.TEACHER or request.user.is_staff or request.user.role == User.Role.ADMIN)
        )

class IsAdminUserOrAdminRole(permissions.BasePermission):
    """
    Custom permission to allow access only to Admin users or Django Superusers/Staff.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser)
        )

# Alias for backwards compatibility & convenience
IsAdminRole = IsAdminUserOrAdminRole

