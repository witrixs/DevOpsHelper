from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.deps import get_current_admin
from core.rate_limit import limit_api
from db.session import get_db
from models.user import User
from schemas.guide import GuideCreate, GuideListItem, GuideOut, GuideUpdate
from services import guides as guides_service

router = APIRouter(prefix="/guides", tags=["guides"])


@router.get("", response_model=list[GuideListItem])
async def list_published_guides(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> list:
    limit_api(request, action="guides-list", limit=90, window_seconds=60)
    return await guides_service.list_published(db)


@router.get("/mine", response_model=list[GuideListItem])
async def list_my_guides(
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> list:
    limit_api(request, action="guides-mine", limit=60, window_seconds=60)
    return await guides_service.list_for_admin(db, admin)


@router.get("/id/{guide_id}", response_model=GuideOut)
async def get_guide_by_id(
    guide_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> object:
    limit_api(request, action="guides-get-id", limit=60, window_seconds=60)
    return await guides_service.get_by_id_for_admin(db, guide_id, admin)


@router.get("/{slug}", response_model=GuideOut)
async def get_guide(
    slug: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> object:
    limit_api(request, action="guides-get", limit=120, window_seconds=60)
    return await guides_service.get_by_slug(db, slug, allow_unpublished=False)


@router.post("", response_model=GuideOut, status_code=status.HTTP_201_CREATED)
async def create_guide(
    payload: GuideCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> object:
    limit_api(request, action="guides-create", limit=20, window_seconds=60)
    return await guides_service.create_guide(db, admin, payload)


@router.patch("/{guide_id}", response_model=GuideOut)
async def update_guide(
    guide_id: int,
    payload: GuideUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> object:
    limit_api(request, action="guides-update", limit=40, window_seconds=60)
    return await guides_service.update_guide(db, admin, guide_id, payload)


@router.delete("/{guide_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_guide(
    guide_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> None:
    limit_api(request, action="guides-delete", limit=20, window_seconds=60)
    await guides_service.delete_guide(db, admin, guide_id)
