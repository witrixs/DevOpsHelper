"""Share / OG meta for SPA HTML responses.

Source of truth for guides: web/src/data/guides-meta.json
(copied to web/dist/guides-meta.json on frontend build).

Rule for the future:
- home → site title + APP description + /og-images.png
- /guides/{slug} → guide title/description + same /og-images.png
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

APP_NAME = "DevOpsHelper"
APP_TAGLINE = "Инструкции для Linux"
APP_TITLE = f"{APP_NAME} — инструкции для Linux"
APP_DESCRIPTION = (
    "Чистые Markdown-гайды по Linux: установка приложений, "
    "настройка сервисов и команды, которые можно сразу копировать."
)
OG_IMAGE_PATH = "/og-images.png"
OG_IMAGE_WIDTH = "1672"
OG_IMAGE_HEIGHT = "941"


@dataclass(frozen=True)
class PageMeta:
    title: str
    description: str
    image_alt: str
    og_type: str


def home_meta() -> PageMeta:
    return PageMeta(
        title=APP_TITLE,
        description=APP_DESCRIPTION,
        image_alt=APP_TITLE,
        og_type="website",
    )


def guide_meta(guide: dict) -> PageMeta:
    title = f"{guide['title']} — инструкции для Linux | {APP_NAME}"
    description = (guide.get("description") or "").strip() or (
        f"{guide.get('blurb', '').rstrip('.')}. {APP_TAGLINE}."
    )
    return PageMeta(
        title=title,
        description=description,
        image_alt=f"{guide['title']} — {APP_NAME}",
        og_type="article",
    )


@lru_cache
def load_guides_meta(path: str) -> dict[str, dict]:
    file_path = Path(path)
    if not file_path.is_file():
        return {}
    raw = json.loads(file_path.read_text(encoding="utf-8"))
    return {item["slug"]: item for item in raw if "slug" in item}


def resolve_meta(path: str, guides_meta_path: Path) -> PageMeta:
    normalized = path.strip("/")
    match = re.fullmatch(r"guides/([^/]+)", normalized)
    if not match:
        return home_meta()

    guides = load_guides_meta(str(guides_meta_path))
    guide = guides.get(match.group(1))
    if not guide:
        return home_meta()
    return guide_meta(guide)


def _replace_attr(html: str, attr: str, key: str, content: str) -> str:
    pattern = rf'(<meta\s+{attr}="{re.escape(key)}"\s+content=")([^"]*)("\s*/?>)'
    if re.search(pattern, html, flags=re.IGNORECASE):
        return re.sub(pattern, rf"\g<1>{content}\g<3>", html, count=1, flags=re.IGNORECASE)

    tag = f'<meta {attr}="{key}" content="{content}" />'
    return html.replace("</head>", f"    {tag}\n  </head>", 1)


def apply_seo_to_html(html: str, meta: PageMeta, *, origin: str, path: str) -> str:
    origin = origin.rstrip("/")
    page_url = f"{origin}/{path.lstrip('/')}" if path.strip("/") else f"{origin}/"
    image_url = f"{origin}{OG_IMAGE_PATH}"

    html = re.sub(
        r"<title>[^<]*</title>",
        f"<title>{meta.title}</title>",
        html,
        count=1,
        flags=re.IGNORECASE,
    )

    replacements: list[tuple[str, str, str]] = [
        ("name", "description", meta.description),
        ("property", "og:type", meta.og_type),
        ("property", "og:locale", "ru_RU"),
        ("property", "og:site_name", APP_NAME),
        ("property", "og:title", meta.title),
        ("property", "og:description", meta.description),
        ("property", "og:url", page_url),
        ("property", "og:image", image_url),
        ("property", "og:image:type", "image/png"),
        ("property", "og:image:width", OG_IMAGE_WIDTH),
        ("property", "og:image:height", OG_IMAGE_HEIGHT),
        ("property", "og:image:alt", meta.image_alt),
        ("name", "twitter:card", "summary_large_image"),
        ("name", "twitter:title", meta.title),
        ("name", "twitter:description", meta.description),
        ("name", "twitter:image", image_url),
        ("name", "twitter:image:alt", meta.image_alt),
    ]

    for attr, key, content in replacements:
        html = _replace_attr(html, attr, key, content)

    return html
