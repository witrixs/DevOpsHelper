from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.guide import Guide
from models.user import User
from schemas.guide import GuideCreate, GuideUpdate


async def list_published(db: AsyncSession) -> list[Guide]:
    result = await db.execute(
        select(Guide)
        .where(Guide.is_published.is_(True))
        .order_by(Guide.updated_at.desc())
    )
    return list(result.scalars().all())


async def list_for_admin(db: AsyncSession, admin: User) -> list[Guide]:
    result = await db.execute(
        select(Guide)
        .where(Guide.author_id == admin.id)
        .order_by(Guide.updated_at.desc())
    )
    return list(result.scalars().all())


async def get_by_slug(db: AsyncSession, slug: str, *, allow_unpublished: bool = False) -> Guide:
    result = await db.execute(select(Guide).where(Guide.slug == slug))
    guide = result.scalar_one_or_none()
    if guide is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guide not found")
    if not guide.is_published and not allow_unpublished:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guide not found")
    return guide


async def get_by_id_for_admin(db: AsyncSession, guide_id: int, admin: User) -> Guide:
    result = await db.execute(select(Guide).where(Guide.id == guide_id))
    guide = result.scalar_one_or_none()
    if guide is None or guide.author_id != admin.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guide not found")
    return guide


async def create_guide(db: AsyncSession, admin: User, payload: GuideCreate) -> Guide:
    existing = await db.execute(select(Guide).where(Guide.slug == payload.slug))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")

    guide = Guide(
        slug=payload.slug,
        title=payload.title,
        blurb=payload.blurb,
        description=payload.description,
        content=payload.content,
        group_name=payload.group_name,
        read_time=payload.read_time,
        is_published=payload.is_published,
        author_id=admin.id,
    )
    db.add(guide)
    await db.commit()
    await db.refresh(guide)
    return guide


async def update_guide(
    db: AsyncSession,
    admin: User,
    guide_id: int,
    payload: GuideUpdate,
) -> Guide:
    guide = await get_by_id_for_admin(db, guide_id, admin)
    data = payload.model_dump(exclude_unset=True)

    if "slug" in data and data["slug"] != guide.slug:
        clash = await db.execute(select(Guide).where(Guide.slug == data["slug"]))
        if clash.scalar_one_or_none() is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")

    for key, value in data.items():
        setattr(guide, key, value)

    await db.commit()
    await db.refresh(guide)
    return guide


async def delete_guide(db: AsyncSession, admin: User, guide_id: int) -> None:
    guide = await get_by_id_for_admin(db, guide_id, admin)
    await db.delete(guide)
    await db.commit()
