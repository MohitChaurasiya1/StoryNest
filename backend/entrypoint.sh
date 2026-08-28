#!/usr/bin/env bash
# entrypoint.sh — runs migrations then starts gunicorn
set -o errexit

echo "==> Running database migrations..."
python manage.py migrate --no-input

echo "==> Collecting static files..."
python manage.py collectstatic --no-input --clear

echo "==> Creating superuser (if env vars set)..."
python manage.py shell -c "
import os, django
from api.models import User

username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@storynest.com')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD', '')

if not password:
    print('DJANGO_SUPERUSER_PASSWORD not set — skipping superuser creation')
elif not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    User.objects.filter(username=username).update(role='ADMIN')
    print(f'Superuser created: {username}')
else:
    print(f'Superuser already exists: {username}')
" || true

echo "==> Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 core.wsgi:application
