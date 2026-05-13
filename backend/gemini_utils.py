from google import genai  # type: ignore
from google.genai import types  # type: ignore
import os
import json

def _get_client():
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_summary_and_quiz(text: str) -> dict | None:
    """Generates a summary and 10-question multiple choice quiz from document text."""
    prompt = f"""You are an expert study assistant. Analyse the following document and return a JSON response with exactly this structure:
{{
  "summary": "<A clear 3-5 paragraph summary covering the main points of the document>",
  "quiz": [
    {{
      "question": "<question text>",
      "options": ["A) <option>", "B) <option>", "C) <option>", "D) <option>"],
      "answer": "<A, B, C, or D>"
    }}
  ]
}}

Rules:
- The summary must cover all major topics in the document.
- Generate exactly 10 quiz questions spread across the whole document, not just the beginning.
- Each question must have exactly 4 options labelled A) B) C) D).
- The answer field must be just the letter (A, B, C, or D).

Document:
{text}"""

    try:
        client = _get_client()
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Summary/Quiz Error: {e}")
        return None

def generate_flashcards(text: str) -> dict | None:
    """Generates 10 flashcards (Q&A pairs) from document text."""
    prompt = f"""You are an expert study assistant. Analyse the following document and return a JSON response with exactly this structure:
{{
  "flashcards": [
    {{
      "question": "<most likely exam or interview question based on this content>",
      "answer": "<concise, accurate answer>"
    }}
  ]
}}

Rules:
- Generate exactly 10 flashcards.
- Questions should cover different parts of the document — do not cluster around one section.
- Answers should be concise but complete (1-3 sentences).

Document:
{text}"""

    try:
        client = _get_client()
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Flashcard Error: {e}")
        return None
