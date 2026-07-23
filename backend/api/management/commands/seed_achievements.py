from django.core.management.base import BaseCommand
from api.models import Achievement

DEFAULT_ACHIEVEMENTS = [
    {
        "code": "BOOKWORM",
        "name": "Bookworm",
        "emoji": "📚",
        "description": "Read 10+ stories",
        "required_count": 10,
    },
    {
        "code": "EXPLORER",
        "name": "Explorer",
        "emoji": "🧭",
        "description": "Tried 3 genres or themes",
        "required_count": 3,
    },
    {
        "code": "BILINGUAL",
        "name": "Bilingual",
        "emoji": "🌍",
        "description": "Read in 2 languages (English & Hindi)",
        "required_count": 1,
    },
    {
        "code": "NIGHT_OWL",
        "name": "Night Owl",
        "emoji": "🦉",
        "description": "5 bedtime reads logged",
        "required_count": 5,
    },
    {
        "code": "STORYTELLER",
        "name": "Storyteller",
        "emoji": "✍️",
        "description": "Co-created a story with parent",
        "required_count": 1,
    },
    {
        "code": "CHAMPION",
        "name": "Champion",
        "emoji": "🏆",
        "description": "Achieved a 7-day reading streak",
        "required_count": 7,
    },
]

class Command(BaseCommand):
    help = "Seeds initial system achievements into the database"

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for ach_data in DEFAULT_ACHIEVEMENTS:
            achievement, created = Achievement.objects.update_or_create(
                code=ach_data["code"],
                defaults={
                    "name": ach_data["name"],
                    "emoji": ach_data["emoji"],
                    "description": ach_data["description"],
                    "required_count": ach_data["required_count"],
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded achievements! Created: {created_count}, Updated: {updated_count}"
            )
        )
