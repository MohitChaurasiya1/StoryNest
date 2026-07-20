from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        PARENT = 'PARENT', 'Parent'
        CHILD = 'CHILD', 'Child'

    role = models.CharField(
        max_length=15,
        choices=Role.choices,
        default=Role.CHILD
    )

    # Basic helper fields
    phone = models.CharField(max_length=15, blank=True, null=True)
    
    def __str__(self):
        return f"{self.username} ({self.role})"
