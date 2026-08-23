FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for postgresql & image processing
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

# Collect static files during Docker build
RUN python manage.py collectstatic --no-input

# Run migrations, auto-initialize admin, and start Gunicorn on Render
CMD ["sh", "-c", "python manage.py migrate --no-input && python manage.py init_admin && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT"]
