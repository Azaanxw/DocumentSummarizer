from google import genai  # type: ignore
from google.genai import types  # type: ignore
from openai import OpenAI
import os
import json


def _get_gemini():
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def _get_openai():
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _gemini(prompt: str) -> dict:
    client = _get_gemini()
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    return json.loads(response.text)


def _openai(prompt: str) -> dict:
    client = _get_openai()
    response = client.chat.completions.create(
        model="gpt-5.4-nano-2026-03-17",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content or "{}")


def _generate(prompt: str, label: str) -> dict | None:
    try:
        return _gemini(prompt)
    except Exception as e:
        print(f"Gemini {label} Error: {e} — falling back to OpenAI")
    try:
        return _openai(prompt)
    except Exception as e:
        print(f"OpenAI {label} Error: {e}")
        return None


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
    return _generate(prompt, "Summary/Quiz")


def generate_answer(question: str, chunks: list[dict]) -> dict | None:
    """Generates a grounded answer with page citations from retrieved chunks."""
    context = "\n\n".join(
        f"[Page {c['metadata']['page_number']}]\n{c['content']}" for c in chunks
    )
    prompt = f"""You are a precise study assistant. Answer the question using ONLY the context provided below. Do not use any outside knowledge.

Return a JSON response with exactly this structure:
{{
  "answer": "<your answer based solely on the context>",
  "citations": [
    {{
      "page_number": <integer>,
      "snippet": "<exact short quote from the context that supports your answer>"
    }}
  ]
}}

Rules:
- If the context does not contain enough information to answer, set answer to "The document does not contain enough information to answer this question." and return an empty citations array.
- Citations must reference only pages that appear in the context.
- Snippets must be direct quotes from the context, not paraphrases.

Context:
{context}

Question: {question}"""
    return _generate(prompt, "Answer")


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
    return _generate(prompt, "Flashcards")
