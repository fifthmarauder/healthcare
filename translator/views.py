import openai
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
import json
from healthcare_translation.settings import OPENAPI_KEY


# Set your OpenAI API Key
openai.api_key = OPENAPI_KEY

@csrf_exempt
def translate_text_openai(request):
    if request.method == "POST":
        data = json.loads(request.body)
        input_text = data.get("text", "")
        input_language = data.get("input_language", "en")
        output_language = data.get("output_language", "es")

        if not input_text:
            return JsonResponse({"error": "No text provided"}, status=400)
        if not output_language:
            return JsonResponse({"error": "No output language provided"}, status=400)

        try:
            # Use input and output languages in the translation context
            messages = [
                {"role": "system", "content": f"You are a helpful assistant that translates text from {input_language} to {output_language}."},
                {"role": "user", "content": f"Translate this while giving only the translated sentence: {input_text}"}
            ]

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=100,
                temperature=0.5
            )

            translated_text = response["choices"][0]["message"]["content"].strip()
            return JsonResponse({"translated_text": translated_text})

        except Exception as e:
            print("OpenAI API Error:", e)
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)

def index(request):
    return render(request, "dj/index.html")
