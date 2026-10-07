import os
import json
from typing import List, Optional

class Settings:
    PROJECT_NAME: str = "Rupertrace"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment & Paths
    IS_SERVERLESS: bool = bool(
        os.getenv("VERCEL") or 
        os.getenv("VERCEL_ENV") or 
        os.getenv("AWS_LAMBDA_FUNCTION_NAME") or 
        os.getenv("LAMBDA_TASK_ROOT") or
        os.getenv("NOW_REGION")
    )
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Database
    _raw_db_url = os.getenv("DATABASE_URL")
    if _raw_db_url:
        if _raw_db_url.startswith("postgres://"):
            _raw_db_url = _raw_db_url.replace("postgres://", "postgresql://", 1)
        DATABASE_URL: str = _raw_db_url
    else:
        # If in serverless without explicit DATABASE_URL, use /tmp sqlite for temporary runtime
        if IS_SERVERLESS:
            DATABASE_URL: str = "sqlite:////tmp/receiptguard.db"
        else:
            DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'receiptguard.db')}"

    # File Storage Paths
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/tmp/uploads" if IS_SERVERLESS else os.path.join(BASE_DIR, "uploads"))
    VAULT_DIR: str = os.getenv("VAULT_DIR", "/tmp/vault" if IS_SERVERLESS else os.path.join(BASE_DIR, "uploads", "vault"))
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "/tmp/chroma_db" if IS_SERVERLESS else os.path.join(BASE_DIR, "chroma_db"))

    # Demo Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "false").lower() in ("true", "1", "yes")
    
    # Storage Provider: "local" or "supabase"
    STORAGE_PROVIDER: str = os.getenv("STORAGE_PROVIDER", "local").lower()
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    SUPABASE_STORAGE_BUCKET: str = os.getenv("SUPABASE_STORAGE_BUCKET", "receipt-vault")

    # AI Provider: "deterministic", "openai", or "ollama"
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "deterministic").lower()
    AI_API_KEY: Optional[str] = os.getenv("AI_API_KEY")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4o-mini")
    AI_BASE_URL: Optional[str] = os.getenv("AI_BASE_URL")

    # OCR Provider: "auto", "local", or "openai"
    OCR_PROVIDER: str = os.getenv("OCR_PROVIDER", "auto").lower()
    OCR_API_KEY: Optional[str] = os.getenv("OCR_API_KEY")

    # Local Ollama Fallback Settings
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3")
    OLLAMA_EMBEDDING_MODEL: str = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
    
    # CORS
    _raw_cors = os.getenv("CORS_ORIGINS")
    if _raw_cors:
        try:
            CORS_ORIGINS: List[str] = json.loads(_raw_cors)
        except Exception:
            CORS_ORIGINS: List[str] = [origin.strip() for origin in _raw_cors.split(",") if origin.strip()]
    else:
        CORS_ORIGINS: List[str] = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:5175",
            "http://127.0.0.1:5175",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://*.vercel.app",
            "*"
        ]

    # Security & Limits
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt"]

settings = Settings()

# Safely ensure required writable directories exist without failing on read-only environments
for directory in [settings.UPLOAD_DIR, settings.VAULT_DIR]:
    try:
        os.makedirs(directory, exist_ok=True)
    except Exception:
        pass
