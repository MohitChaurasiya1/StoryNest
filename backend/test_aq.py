

import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

key = os.getenv('GEMINI_API_KEY')
print("Testing Key:", key[:15] + "..." if key else "None")

# Test list models endpoint first
list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
try:
    res = urllib.request.urlopen(list_url)
    models_data = json.loads(res.read().decode('utf-8'))
    available_models = [m['name'].replace('models/', '') for m in models_data.get('models', []) if 'generateContent' in m.get('supportedGenerationMethods', [])]
    print("Available generateContent models for this key:")
    print(available_models[:10])
except Exception as e:
    print("Could not fetch model list:", e)
    available_models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash-8b"]

payload = json.dumps({'contents': [{'parts': [{'text': 'Say Hi in 3 words'}]}]}).encode('utf-8')

for model in available_models:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    try:
        res = urllib.request.urlopen(req)
        data = json.loads(res.read().decode('utf-8'))
        text = data['candidates'][0]['content']['parts'][0]['text']
        print(f"SUCCESS with model: {model} -> Result: {text.strip()}")
    except urllib.error.HTTPError as e:
        err_text = e.read().decode('utf-8')
        print(f"FAIL model: {model} -> Code {e.code}: {err_text[:100]}")
