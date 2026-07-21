import os
import json
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

def generate_story_content(params):
    """
    Constructs a detailed prompt and calls the Gemini API to generate
    a structured bilingual children's storybook.
    """
    # Load API Key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        logger.warning("GEMINI_API_KEY not configured. Falling back to simulated story.")
        return None

    try:
        genai.configure(api_key=api_key)
        # Use gemini-1.5-flash as it is fast, cheap, and very capable
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Build prompt depending on the mode
        builder_mode = params.get("builderMode", "child")
        child_name = params.get("childName", "Leo")
        child_age = params.get("childAge", "7")
        child_gender = params.get("childGender", "boy")
        family = params.get("familyDetails", "")
        favorites = params.get("favoriteThings", "")
        interests = params.get("specialInterests", "")
        
        # Determine language instructions
        language = params.get("language", "bilingual")
        if language == "en":
            lang_instruction = "The story must be written in English only. Put empty string or null for text_es."
        elif language == "es":
            lang_instruction = "The story must be written in Spanish only. Put the Spanish text in text_es, and leave text_en empty or null."
        elif language == "hi":
            lang_instruction = "The story must be bilingual with English and Hindi. Put English in text_en, and the Hindi translation (in Devanagari script) in text_es."
        else: # bilingual
            lang_instruction = "The story must be bilingual with English and Spanish. Put English in text_en, and the Spanish translation in text_es."

        if builder_mode == "child":
            hero_animal = params.get("heroAnimal", "lion")
            hero_job = params.get("heroJob", "astronaut")
            hero_color = params.get("heroColor", "gold")
            setting = params.get("setting", "space")
            companion = params.get("companion", "funny-robot")
            mood = params.get("storyMood", "happy")
            power = params.get("magicPower", "fly")
            ending = params.get("storyEnding", "happy")
            
            prompt = f"""
            Write a delightful children's storybook starring a protagonist named '{child_name}', who is a {child_age}-year-old {child_gender}.
            In this story, {child_name} is represented as a cute, friendly cartoon {hero_animal} who works as a {hero_job} and wears a magic {hero_color} cape.
            The setting of the story is: {setting}.
            The protagonist is joined by a companion: {companion}.
            The overall mood of the story should be {mood}.
            The protagonist has the magical power to {power}.
            The story should have a {ending} ending.
            
            Additional personalization details:
            - Family: {family}
            - Favorite things: {favorites}
            - Special interests/fears: {interests}
            
            Structure specifications:
            - Write exactly 5 pages.
            - {lang_instruction}
            - Vocabulary level: Grade level suitable for a {child_age}-year-old child.
            - Include a 'dictionary' for each page containing 1-2 new, interesting, or challenging words from the page text, mapped to their definitions (suitable for the child's age).
            - Include an 'illustration_prompt' for each page. The prompt must describe the page's scene in detail, keeping the characters consistent and specifying a whimsical, colorful cartoon art style.
            """
        else: # custom / Parent & Teacher mode
            moral = params.get("moral", "kindness")
            vocab_theme = params.get("vocabTheme", "science")
            story_length = params.get("storyLength", "medium")
            encouraged = params.get("encouragedBehavior", "")
            sidekick = params.get("sidekick", "wise-owl")
            magic_obj = params.get("magicObject", "secret-map")
            art_style = params.get("artStyle", "watercolor")
            tone = params.get("tone", "whimsical")
            grade = params.get("grade", "grade-2")
            pronoun = params.get("pronoun", "he")
            rival = params.get("rival", "none")
            num_pages = params.get("numPages", 5)
            difficulty = params.get("readingDifficulty", "medium")
            culture = params.get("culturalElements", "mixed")
            bedtime = params.get("bedtimeSafe", "yes")

            prompt = f"""
            Write an educational, engaging children's storybook starring a protagonist named '{child_name}', who is a {child_age}-year-old {child_gender} (referred to with pronoun '{pronoun}').
            
            Story outline details:
            - Core Moral / Life Lesson: {moral}
            - Key Magical Tool / Artifact: {magic_obj}
            - Companion / Sidekick: {sidekick}
            - Antagonist / Rival: {rival}
            - Setting & Cultural Elements: inspired by {culture} themes.
            - Tone: {tone}
            - Bedtime Safe: {'Yes, ensure the story is calm, soothing, and has no scary elements.' if bedtime == 'yes' else 'Mild action/tension is acceptable, but still child-friendly.'}
            - Behavior to encourage: {encouraged} (subtly weave this action or habit into the narrative as a positive example).
            
            Reading & Language constraints:
            - Grade Level: {grade} (suitable for a {child_age}-year-old).
            - Reading Difficulty: {difficulty}.
            - Number of Pages: exactly {num_pages} pages.
            - Story Length: {story_length} (short: 30-50 words per page, medium: 50-80 words per page, long: 80-120 words per page).
            - {lang_instruction}
            - Vocabulary Focus Theme: {vocab_theme}. Each page must contain 1-2 words related to this theme.
            - Include a 'dictionary' for each page containing these vocabulary focus words, mapped to simple, kid-friendly explanations.
            - Include an 'illustration_prompt' for each page describing the scene in detail, using a '{art_style}' style. Keep character appearances consistent.
            """

        system_instruction = """
        You are a world-class children's story writer and language educator.
        You write engaging stories that weave personal details, morals, and vocabulary themes seamlessly.
        
        You must return a JSON object exactly matching this schema:
        {
          "title_en": "String - English title of the story",
          "title_es": "String - Spanish (or Hindi) title of the story",
          "pages": [
            {
              "page_number": Integer (starting from 1),
              "text_en": "String - The English story text for this page",
              "text_es": "String - The translation story text for this page",
              "illustration_prompt": "String - Detailed image generation prompt describing characters, background, action, and art style",
              "dictionary": {
                "word": "definition",
                "another_word": "definition"
              }
            }
          ]
        }
        Do not wrap the JSON output in markdown tags. Return raw valid JSON.
        """

        response = model.generate_content(
            contents=[prompt],
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.7
            },
            system_instruction=system_instruction
        )
        
        # Parse the JSON response
        story_data = json.loads(response.text)
        return story_data
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        return None
