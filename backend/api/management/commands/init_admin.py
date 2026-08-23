import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Automatically creates or updates an admin superuser using environment variables on deploy'

    def handle(self, *args, **options):
        username = os.getenv('DJANGO_SUPERUSER_USERNAME')
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@storynest.com')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

        if not username or not password:
            self.stdout.write(self.style.WARNING(
                "DJANGO_SUPERUSER_USERNAME or DJANGO_SUPERUSER_PASSWORD not set in environment. Skipping admin auto-creation."
            ))
            return

        user = User.objects.filter(username__iexact=username).first()
        if not user and email:
            user = User.objects.filter(email__iexact=email).first()

        if user:
            user.username = username
            user.email = email
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.role = User.Role.ADMIN
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' updated successfully with active credentials."))
        else:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            user.role = User.Role.ADMIN
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created successfully."))
