import json
import os

from dotenv import load_dotenv

load_dotenv()

_client = None


def get_openai_client():
    global _client
    try:
        from openai import OpenAI
    except ImportError:
        return None

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    if _client is None:
        _client = OpenAI(api_key=api_key)
    return _client


def chat_completion(system_prompt: str, user_prompt: str) -> str | None:
    client = get_openai_client()
    if client is None:
        return None

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception:
        return None


def chat_completion_json(system_prompt: str, user_prompt: str) -> dict | None:
    text = chat_completion(system_prompt, user_prompt)
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None
