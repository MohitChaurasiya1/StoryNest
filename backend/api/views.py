from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Story, StoryPage
from .serializers import StorySerializer, StoryPageSerializer
from .gemini import generate_story_content

class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.all().prefetch_related('pages')
    serializer_class = StorySerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_story_api(request):
    """
    POST /api/stories/generate/
    Receives parameters from StoryCreator wizard, sends them to Gemini (or simulated fallback),
    saves the story & its pages into database, and returns the serialized Story object.
    """
    params = request.data
    
    # 1. Call Gemini integration
    story_data = generate_story_content(params)
    
    # Check if we should fall back to simulation
    is_simulated = False
    if not story_data:
        is_simulated = True
        # Generate simulated story structure
        builder_mode = params.get("builderMode", "child")
        child_name = params.get("childName", "Leo")
        animal = params.get("heroAnimal", "lion")
        setting = params.get("setting", "space")
        companion = params.get("companion", "funny-robot")
        color = params.get("heroColor", "gold")
        power = params.get("magicPower", "fly")
        mood = params.get("storyMood", "happy")
        sidekick = params.get("sidekick", "wise-owl")
        num_pages = int(params.get("numPages", 5)) if builder_mode == "custom" else 5
        
        buddy = companion if builder_mode == "child" else sidekick
        
        story_data = {
            "title_en": f"{child_name}'s Grand Adventure in the {setting.capitalize()}",
            "title_es": f"La Gran Aventura de {child_name} en el {setting.capitalize()}",
            "pages": []
        }
        
        templates = [
            {
                "text_en": f"Once upon a time, {child_name} the brave {animal} woke up in the {setting} wearing a shimmering {color} cape! Today was the day of the Grand Adventure.",
                "text_es": f"Érase una vez, {child_name} el valiente {animal} se despertó en el {setting} con una capa brillante de color {color}. ¡Hoy era el día de la Gran Aventura!",
                "illustration_prompt": f"A cute {animal} character with a {color} cape standing in {setting}, children's book illustration style",
                "dictionary": { "adventure": "An exciting journey into the unknown", "cape": "A flowing cloth worn on the shoulders" }
            },
            {
                "text_en": f"{child_name} discovered {buddy} hiding behind a giant crystal. 'Want to come along?' asked {child_name}. The {buddy} jumped with joy!",
                "text_es": f"{child_name} descubrió a {buddy} escondido detrás de un cristal gigante. '¿Quieres venir?' preguntó {child_name}. ¡El {buddy} saltó de alegría!",
                "illustration_prompt": f"The {animal} meeting {buddy} near a giant crystal in {setting}",
                "dictionary": { "companion": "A friend who travels with you", "crystal": "A beautiful clear stone" }
            },
            {
                "text_en": f"Together, they faced the Twisting Tunnel of Echoes. {child_name} used the power to {power} and carried everyone safely across!",
                "text_es": f"Juntos, enfrentaron el Túnel Retorcido de los Ecos. ¡{child_name} usó el poder de {power} y llevó a todos a salvo al otro lado!",
                "illustration_prompt": f"The heroes navigating through a magical tunnel with echoing lights",
                "dictionary": { "tunnel": "A long underground passage", "courage": "Being brave when scared" }
            },
            {
                "text_en": f"At the heart of the {setting}, they found a golden treasure chest glowing with rainbow light. Inside was the Jewel of {mood.capitalize()}.",
                "text_es": f"En el corazón del {setting}, encontraron un cofre del tesoro dorado brillando con luz de arcoíris. Dentro estaba la Joya de la {mood.capitalize()}.",
                "illustration_prompt": f"A magical treasure chest glowing with rainbow light in {setting}",
                "dictionary": { "treasure": "Something very valuable and special", "jewel": "A precious sparkling stone" }
            },
            {
                "text_en": f"{child_name} brought the jewel home and shared its magic with the whole family. From that day on, every bedtime story became a new adventure! The End.",
                "text_es": f"{child_name} llevó la joya a casa y compartió su magia con toda la familia. ¡Desde ese día, cada cuento antes de dormir se convirtió en una nueva aventura! Fin.",
                "illustration_prompt": f"The {animal} hero back home sharing a glowing jewel with a happy family",
                "dictionary": { "family": "The people you love and live with", "share": "To give part of something to others" }
            },
            {
                "text_en": f"But wait — the {buddy} noticed a tiny map hidden inside the treasure chest. It pointed to an even BIGGER adventure beyond the stars!",
                "text_es": f"¡Pero espera! El {buddy} notó un pequeño mapa escondido dentro del cofre del tesoro. ¡Apuntaba a una aventura AÚN MÁS GRANDE más allá de las estrellas!",
                "illustration_prompt": f"A tiny magical map unfurling from the treasure chest with glowing star paths",
                "dictionary": { "map": "A drawing that shows where places are", "mystery": "Something secret waiting to be discovered" }
            },
            {
                "text_en": f"{child_name} and {buddy} looked at each other and smiled. 'Are you ready?' asked {child_name}. 'Always!' replied the {buddy}. And off they went, soaring into the sunset.",
                "text_es": f"{child_name} y {buddy} se miraron y sonrieron. '¿Estás listo?' preguntó {child_name}. '¡Siempre!' respondió el {buddy}. Y se fueron, volando hacia el atardecer.",
                "illustration_prompt": f"Two friends soaring into a colorful sunset sky together",
                "dictionary": { "friendship": "A close bond between two beings", "sunset": "When the sun goes down beautifully" }
            },
            {
                "text_en": f"And so, the legend of {child_name} the {animal} grew across the land. Every child who heard the tale felt a spark of bravery in their heart. 🌟",
                "text_es": f"Y así, la leyenda de {child_name} el {animal} creció por toda la tierra. Cada niño que escuchó la historia sintió una chispa de valentía en su corazón. 🌟",
                "illustration_prompt": f"A legendary hero {animal} silhouette against a starry sky",
                "dictionary": { "legend": "A famous story passed down through time", "bravery": "Having the courage to do something hard" }
            }
        ]
        
        # Build pages list matching requested page count
        for i in range(num_pages):
            tpl = templates[i % len(templates)]
            story_data["pages"].append({
                "page_number": i + 1,
                "text_en": tpl["text_en"],
                "text_es": tpl["text_es"],
                "illustration_prompt": tpl["illustration_prompt"],
                "dictionary": tpl["dictionary"]
            })
            
    # 2. Save Story instance to Database
    story = Story.objects.create(
        child_name=params.get("childName", "Leo"),
        child_age=int(params.get("childAge")) if params.get("childAge") else None,
        child_gender=params.get("childGender", "boy"),
        builder_mode=params.get("builderMode", "child"),
        
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
        language=params.get("language", "bilingual"),
        story_length=params.get("storyLength", "medium"),
        encouraged_behavior=params.get("encouragedBehavior"),
        sidekick=params.get("sidekick"),
        magic_object=params.get("magicObject"),
        art_style=params.get("artStyle", "watercolor"),
        tone=params.get("tone", "whimsical"),
        grade=params.get("grade", "grade-2"),
        pronoun=params.get("pronoun", "he"),
        rival=params.get("rival"),
        num_pages=int(params.get("numPages", 5)) if params.get("numPages") else 5,
        reading_difficulty=params.get("readingDifficulty", "medium"),
        cultural_elements=params.get("culturalElements", "mixed"),
        bedtime_safe=params.get("bedtimeSafe", "yes")
    )
    
    # Apply titles
    title_en = story_data.get("title_en", f"{story.child_name}'s Adventure")
    title_es = story_data.get("title_es", title_en)
    
    story.title_en = title_en
    story.title_es = title_es
    story.save()

    # 3. Save StoryPage instances to Database
    for page_data in story_data.get("pages", []):
        StoryPage.objects.create(
            story=story,
            page_number=page_data.get("page_number", 1),
            text_en=page_data.get("text_en", ""),
            text_es=page_data.get("text_es", ""),
            illustration_prompt=page_data.get("illustration_prompt", ""),
            dictionary=page_data.get("dictionary", {})
        )

    # 4. Serialize and return the story
    serializer = StorySerializer(story)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
