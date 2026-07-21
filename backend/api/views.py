from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .gemini import generate_story_content
from .models import Story, StoryPage
from .serializers import StorySerializer


class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.all().prefetch_related("pages")
    serializer_class = StorySerializer
    permission_classes = [AllowAny]


@api_view(["POST"])
@permission_classes([AllowAny])
def generate_story_api(request):
    """
    POST /api/stories/generate/

    Receives story parameters from the React frontend,
    generates the story using Gemini AI,
    saves the story in the database,
    and returns the saved story.

    No hardcoded fallback story is used.
    """

    params = request.data

    # ---------------------------------------------------------
    # 1. Generate story using Gemini AI
    # ---------------------------------------------------------

    try:
        story_data = generate_story_content(params)

    except Exception as error:
        print(f"Gemini generation error: {error}")

        return Response(
            {
                "error": "Gemini story generation failed.",
                "details": (
                    "Unable to generate the story right now. "
                    "Check your Gemini API key, model name, "
                    "internet connection, and backend terminal."
                ),
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    # Gemini returned nothing
    if not story_data:
        return Response(
            {
                "error": "Gemini story generation failed.",
                "details": (
                    "Gemini did not return story content. "
                    "Check the Gemini API key, model name, "
                    "internet connection, and backend logs."
                ),
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    # ---------------------------------------------------------
    # 2. Validate Gemini response
    # ---------------------------------------------------------

    if not isinstance(story_data, dict):
        return Response(
            {
                "error": "Invalid Gemini response.",
                "details": (
                    "Gemini returned data in an unexpected format."
                ),
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    pages = story_data.get("pages")

    if not isinstance(pages, list) or not pages:
        return Response(
            {
                "error": "Invalid Gemini response.",
                "details": (
                    "Gemini did not generate any story pages."
                ),
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    # ---------------------------------------------------------
    # 3. Prepare story titles
    # ---------------------------------------------------------

    child_name = params.get("childName", "Child")

    title_en = str(
        story_data.get(
            "title_en",
            f"{child_name}'s Adventure",
        )
    ).strip()

    title_hi = str(
        story_data.get(
            "title_hi",
            f"{child_name} का रोमांच",
        )
    ).strip()

    if not title_en:
        title_en = f"{child_name}'s Adventure"

    if not title_hi:
        title_hi = f"{child_name} का रोमांच"

    # ---------------------------------------------------------
    # 4. Convert child age safely
    # ---------------------------------------------------------

    try:
        child_age = (
            int(params.get("childAge"))
            if params.get("childAge") not in (None, "")
            else None
        )

    except (TypeError, ValueError):
        child_age = None

    # ---------------------------------------------------------
    # 5. Convert requested number of pages safely
    # ---------------------------------------------------------

    try:
        requested_num_pages = int(
            params.get(
                "numPages",
                len(pages),
            )
        )

    except (TypeError, ValueError):
        requested_num_pages = len(pages)

    requested_num_pages = max(
        1,
        min(requested_num_pages, 16),
    )

    # Keep only requested pages if Gemini returns extra pages
    pages = pages[:requested_num_pages]

    if not pages:
        return Response(
            {
                "error": "Invalid Gemini response.",
                "details": (
                    "No usable story pages were returned."
                ),
            },
            status=status.HTTP_502_BAD_GATEWAY,
        )

    # ---------------------------------------------------------
    # 6. Save story and pages in one transaction
    # ---------------------------------------------------------

    try:
        with transaction.atomic():

            story = Story.objects.create(
                child_name=child_name,
                child_age=child_age,
                child_gender=params.get(
                    "childGender",
                    "child",
                ),
                builder_mode=params.get(
                    "builderMode",
                    "child",
                ),

                hero_animal=params.get("heroAnimal"),
                hero_job=params.get("heroJob"),
                hero_color=params.get("heroColor"),
                setting=params.get("setting"),
                companion=params.get("companion"),
                story_mood=params.get("storyMood"),
                magic_power=params.get("magicPower"),
                story_ending=params.get("storyEnding"),

                moral=params.get("moral"),
                vocab_theme=params.get("vocabTheme"),
                language=params.get(
                    "language",
                    "bilingual",
                ),
                story_length=params.get(
                    "storyLength",
                    "medium",
                ),
                encouraged_behavior=params.get(
                    "encouragedBehavior"
                ),
                sidekick=params.get("sidekick"),
                magic_object=params.get("magicObject"),
                art_style=params.get(
                    "artStyle",
                    "watercolor",
                ),
                tone=params.get(
                    "tone",
                    "whimsical",
                ),
                grade=params.get(
                    "grade",
                    "grade-2",
                ),
                pronoun=params.get(
                    "pronoun",
                    "they",
                ),
                rival=params.get("rival"),

                num_pages=len(pages),

                reading_difficulty=params.get(
                    "readingDifficulty",
                    "medium",
                ),
                cultural_elements=params.get(
                    "culturalElements",
                    "Indian",
                ),
                bedtime_safe=params.get(
                    "bedtimeSafe",
                    "yes",
                ),

                title_en=title_en,
                title_hi=title_hi,
            )

            # -------------------------------------------------
            # 7. Save Gemini-generated story pages
            # -------------------------------------------------

            for index, page_data in enumerate(
                pages,
                start=1,
            ):
                if not isinstance(page_data, dict):
                    raise ValueError(
                        f"Page {index} has an invalid format."
                    )

                text_en = str(
                    page_data.get(
                        "text_en",
                        "",
                    )
                ).strip()

                text_hi = str(
                    page_data.get(
                        "text_hi",
                        "",
                    )
                ).strip()

                if not text_en and not text_hi:
                    raise ValueError(
                        f"Page {index} does not contain story text."
                    )

                dictionary = page_data.get(
                    "dictionary",
                    {},
                )

                if not isinstance(dictionary, dict):
                    dictionary = {}

                StoryPage.objects.create(
                    story=story,
                    page_number=index,
                    text_en=text_en,
                    text_hi=text_hi,
                    illustration_prompt=str(
                        page_data.get(
                            "illustration_prompt",
                            "",
                        )
                    ).strip(),
                    dictionary=dictionary,
                )

    except Exception as error:
        print(f"Story database save error: {error}")

        return Response(
            {
                "error": "Story could not be saved.",
                "details": str(error),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # ---------------------------------------------------------
    # 8. Load saved story with pages
    # ---------------------------------------------------------

    story = (
        Story.objects
        .prefetch_related("pages")
        .get(pk=story.pk)
    )

    # ---------------------------------------------------------
    # 9. Return Gemini-generated saved story
    # ---------------------------------------------------------

    response_data = dict(
        StorySerializer(story).data
    )

    response_data["generated_by"] = "gemini"

    return Response(
        response_data,
        status=status.HTTP_201_CREATED,
    )