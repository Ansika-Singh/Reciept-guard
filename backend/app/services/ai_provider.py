import os
import httpx
from typing import Optional, Dict, Any
from app.config import settings

class BaseAIProvider:
    def generate_completion(
        self,
        system_prompt: str,
        context: str,
        question: str
    ) -> Optional[str]:
        raise NotImplementedError

class ExternalAIProvider(BaseAIProvider):
    """
    Lightweight HTTP client for OpenAI / Groq / OpenRouter / Anthropic compatible APIs.
    Zero heavy SDK dependencies; relies on built-in httpx.
    """
    def __init__(self, api_key: str, model: str = "gpt-4o-mini", base_url: Optional[str] = None):
        self.api_key = api_key
        self.model = model
        self.base_url = (base_url or "https://api.openai.com/v1").rstrip("/")

    def generate_completion(
        self,
        system_prompt: str,
        context: str,
        question: str
    ) -> Optional[str]:
        try:
            url = f"{self.base_url}/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            messages = [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": f"CONTEXT INFORMATION:\n{context}\n\nUSER QUESTION:\n{question}\n\nPlease provide a grounded, factual response based strictly on the context."
                }
            ]
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.1,
                "max_tokens": 500
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0]:
                        return choices[0]["message"].get("content", "").strip()
        except Exception as e:
            print(f"External AI Provider notice: {e}")
        return None

class OllamaAIProvider(BaseAIProvider):
    """
    Local Ollama provider for containerized or offline environments.
    """
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3"):
        self.base_url = base_url.rstrip("/")
        self.model = model

    def generate_completion(
        self,
        system_prompt: str,
        context: str,
        question: str
    ) -> Optional[str]:
        try:
            url = f"{self.base_url}/api/generate"
            prompt_text = (
                f"{system_prompt}\n\n"
                f"CONTEXT INFORMATION:\n{context}\n\n"
                f"USER QUESTION: {question}\n\n"
                f"ANSWER:"
            )
            payload = {
                "model": self.model,
                "prompt": prompt_text,
                "stream": False
            }
            with httpx.Client(timeout=3.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    return res.json().get("response", "").strip()
        except Exception as e:
            # Silently fall back to deterministic response if Ollama is unreachable
            pass
        return None

class DeterministicAIProvider(BaseAIProvider):
    """
    Guaranteed deterministic fallback.
    Yields to the verified database rules engine to prevent hallucinations.
    """
    def generate_completion(
        self,
        system_prompt: str,
        context: str,
        question: str
    ) -> Optional[str]:
        return None

def get_ai_provider() -> BaseAIProvider:
    """
    Factory resolving the appropriate AI provider according to environment settings.
    """
    provider_type = (settings.AI_PROVIDER or "").lower()
    
    # 1. Explicit External Provider (OpenAI, Groq, etc.)
    if settings.AI_API_KEY or provider_type in ("openai", "groq", "openrouter"):
        api_key = settings.AI_API_KEY or ""
        if api_key:
            return ExternalAIProvider(
                api_key=api_key,
                model=settings.AI_MODEL,
                base_url=settings.AI_BASE_URL
            )

    # 2. Local Ollama Provider (Only when explicitly enabled and not in serverless)
    if provider_type == "ollama" and not settings.IS_SERVERLESS:
        return OllamaAIProvider(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_MODEL
        )

    # 3. Default Deterministic Grounded Engine
    return DeterministicAIProvider()

ai_provider = get_ai_provider()
