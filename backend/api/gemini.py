import json
import os

from dotenv import load_dotenv

load_dotenv()

# Try loading new google-genai SDK first, fallback to google-generativeai SDK
try:
    from google import genai
    from google.genai import types
    SDK_MODE = "genai"
except ImportError:
    try:
        import google.generativeai as genai
        SDK_MODE = "generativeai"
    except ImportError:
        SDK_MODE = None


def generate_story_content(params):
    """
    Generate a bilingual children's story using Gemini AI.

    Returns:
        dict: Generated story data.
        None: If Gemini API fails.
    """

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("Gemini Error: GEMINI_API_KEY is missing.")
        return None

    if not SDK_MODE:
        print("Gemini Error: Neither google-genai nor google-generativeai package is installed.")
        return None

    try:
        try:
            num_pages = int(params.get("numPages", 5))
        except (TypeError, ValueError):
            num_pages = 5

        num_pages = max(1, min(num_pages, 16))

        custom_prompt = params.get("customPrompt") or params.get("prompt") or ""
        custom_prompt_section = f"\nUser's Spoken / Custom Story Idea:\n\"{custom_prompt}\"\n" if custom_prompt else ""

        prompt = f"""
You are a professional children's story writer.

Create a safe, positive and age-appropriate bilingual story
in English and Hindi.
{custom_prompt_section}
Story details:
- Child name: {params.get("childName", "Leo")}
- Child age: {params.get("childAge", 7)}
- Hero animal: {params.get("heroAnimal", "lion")}
- Hero job: {params.get("heroJob", "")}
- Hero colour: {params.get("heroColor", "gold")}
- Setting: {params.get("setting", "forest")}
- Companion: {params.get("companion", "friendly robot")}
- Sidekick: {params.get("sidekick", "")}
- Mood: {params.get("storyMood", "happy")}
- Magic power: {params.get("magicPower", "fly")}
- Ending: {params.get("storyEnding", "happy")}
- Moral: {params.get("moral", "kindness and teamwork")}
- Favourite things: {params.get("favoriteThings", "")}
- Special interests: {params.get("specialInterests", "")}
- Number of pages: {num_pages}

Requirements:
1. Return exactly {num_pages} pages.
2. Keep characters consistent on every page.
3. Use simple language suitable for the child's age.
4. Each page must contain English and Hindi text.
5. Each page must include an illustration prompt.
6. Each page must include a small vocabulary dictionary.
7. Avoid violence, fear, unsafe behaviour and adult content.
8. Return valid JSON only.

Required JSON structure:

{{
  "title_en": "English title",
  "title_hi": "Hindi title",
  "moral_en": "English moral",
  "moral_hi": "Hindi moral",
  "pages": [
    {{
      "page_number": 1,
      "text_en": "English page text",
      "text_hi": "Hindi page text",
      "illustration_prompt": "Detailed illustration description",
      "dictionary": {{
        "English word": "Simple meaning",
        "Hindi word": "सरल अर्थ"
      }}
    }}
  ]
}}
"""

        models_to_try = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "models/gemini-2.0-flash",
            "models/gemini-2.0-flash-lite",
        ]

        response_text = None

        if SDK_MODE == "genai":
            client = genai.Client(api_key=api_key)
            for model_name in models_to_try:
                try:
                    res = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            temperature=0.8,
                        ),
                    )
                    if res and res.text:
                        response_text = res.text
                        break
                except Exception as model_err:
                    print(f"Gemini Model {model_name} error: {model_err}. Trying fallback model...")
        else:
            genai.configure(api_key=api_key)
            for model_name in models_to_try:
                try:
                    model = genai.GenerativeModel(
                        model_name=model_name,
                        generation_config={"response_mime_type": "application/json", "temperature": 0.8}
                    )
                    res = model.generate_content(prompt)
                    if res and res.text:
                        response_text = res.text
                        break
                except Exception as model_err:
                    print(f"Gemini Model {model_name} error: {model_err}. Trying fallback model...")

        if not response_text:
            print("Gemini Error: Empty response received from all models.")
            return None

        story_data = json.loads(response_text)

        if not isinstance(story_data, dict):
            print("Gemini Error: Response is not a dictionary.")
            return None

        pages = story_data.get("pages")

        if not isinstance(pages, list) or not pages:
            print("Gemini Error: No pages returned.")
            return None

        return story_data

    except json.JSONDecodeError as error:
        print(f"Gemini JSON Error: {error}")
        return None

    except Exception as error:
        print(f"Gemini API Error: {error}")
        return None