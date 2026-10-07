from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, init_db
from app.api.health import router as health_router
from app.api.receipts import router as receipts_router
from app.api.chat import router as chat_router
from app.api.orders import router as orders_router
from app.api.audit import router as audit_router

# Lazy database initialization without ASGI lifespan dependencies (100% Vercel Serverless compliant)
_db_initialized = False

def ensure_db_ready():
    global _db_initialized
    if not _db_initialized:
        try:
            init_db()
            try:
                from app.seed_data import seed_database
                seed_database()
            except Exception as e:
                print(f"Seed database notice: {e}")
            _db_initialized = True
        except Exception as e:
            print(f"Database init notice: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Rupertrace: Your Personal Purchase Protection Agent API"
)

# Non-blocking middleware ensuring database is initialized on first request
@app.middleware("http")
async def db_init_middleware(request: Request, call_next):
    ensure_db_ready()
    return await call_next(request)

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

# CORS Configuration with Vercel and Render deployment support
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in settings.CORS_ORIGINS if o != "*"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*(\.vercel\.app|\.onrender\.com)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers with and without prefix for flexible serverless routing
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(health_router)
app.include_router(receipts_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(audit_router, prefix=settings.API_V1_STR)

# Register WebSockets only in non-serverless local/Docker environments
if not settings.IS_SERVERLESS:
    try:
        from app.websockets.progress import router as ws_router
        app.include_router(ws_router)
    except Exception as e:
        print(f"WebSocket router notice: {e}")

# Frontend static asset serving when built (Fullstack Render / Docker support)
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
repo_root = os.path.dirname(backend_dir)
candidate_paths = [
    os.path.join(repo_root, "frontend", "dist"),
    os.path.join(backend_dir, "frontend", "dist"),
    os.path.join(os.getcwd(), "frontend", "dist"),
    "/app/frontend/dist"
]
frontend_dist = next((p for p in candidate_paths if os.path.exists(p) and os.path.isdir(p)), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend_assets")

    @app.get("/")
    def serve_frontend_root():
        index_html = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_html):
            return FileResponse(index_html)
        return {
            "message": "Welcome to Rupertrace - Personal Purchase Protection Agent API",
            "docs": "/docs",
            "version": settings.VERSION,
            "status": "online"
        }

    @app.exception_handler(404)
    async def custom_404_handler(request: Request, exc: StarletteHTTPException):
        if not request.url.path.startswith("/api") and not request.url.path.startswith("/docs") and not request.url.path.startswith("/openapi.json"):
            index_html = os.path.join(frontend_dist, "index.html")
            if os.path.exists(index_html):
                return FileResponse(index_html)
        detail_msg = getattr(exc, "detail", "Not Found")
        return JSONResponse(status_code=404, content={"detail": detail_msg})
else:
    @app.get("/")
    def root():
        return {
            "message": "Welcome to Rupertrace - Personal Purchase Protection Agent API",
            "docs": "/docs",
            "version": settings.VERSION,
            "status": "online"
        }

