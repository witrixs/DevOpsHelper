from fastapi import APIRouter, Depends, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from core.deps import get_current_user
from core.rate_limit import limit_auth
from db.session import get_db
from models.user import User
from schemas.auth import Token
from schemas.user import UserCreate, UserOut
from services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    limit_auth(request, action="register", limit=5, window_seconds=60)
    return await auth_service.register_user(db, payload)


@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Token:
    limit_auth(request, action="login", limit=10, window_seconds=60)
    return await auth_service.authenticate_user(
        db,
        username=form_data.username,
        password=form_data.password,
    )


@router.get("/me", response_model=UserOut)
async def me(
    request: Request,
    current_user: User = Depends(get_current_user),
) -> User:
    limit_auth(request, action="me", limit=60, window_seconds=60)
    return current_user
