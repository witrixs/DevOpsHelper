from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware

from api.router import api_router
from core.config import get_settings
from core.seo import apply_seo_to_html, resolve_meta
from db.session import init_db

settings = get_settings()
PROJECT_ROOT = Path(__file__).resolve().parent.parent
WEB_DIST = Path(settings.web_dist)
if not WEB_DIST.is_absolute():
    WEB_DIST = PROJECT_ROOT / WEB_DIST

GUIDES_META_CANDIDATES = (
    WEB_DIST / "guides-meta.json",
    PROJECT_ROOT / "web" / "src" / "data" / "guides-meta.json",
)


def _guides_meta_path() -> Path:
    for candidate in GUIDES_META_CANDIDATES:
        if candidate.is_file():
            return candidate
    return GUIDES_META_CANDIDATES[0]


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
        response.headers.setdefault("X-XSS-Protection", "0")
        if not settings.debug:
            response.headers.setdefault(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            )
        return response


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        lifespan=lifespan,
        docs_url="/api/docs" if settings.debug else None,
        redoc_url=None,
        openapi_url="/api/openapi.json" if settings.debug else None,
    )
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
        max_age=600,
    )
    app.include_router(api_router)

    if WEB_DIST.is_dir():
        assets_dir = WEB_DIST / "assets"
        if assets_dir.is_dir():
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @app.get("/{full_path:path}")
        async def spa_fallback(request: Request, full_path: str):
            candidate = WEB_DIST / full_path
            if full_path and candidate.is_file():
                return FileResponse(candidate)

            index_path = WEB_DIST / "index.html"
            html = index_path.read_text(encoding="utf-8")
            meta = resolve_meta(full_path, _guides_meta_path())
            origin = str(request.base_url).rstrip("/")
            html = apply_seo_to_html(html, meta, origin=origin, path=full_path)
            return HTMLResponse(html)

    return app
