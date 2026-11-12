import asyncio

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.password_policy import validate_password_strength
from core.security import create_access_token, hash_password, verify_password
from models.user import User
from schemas.auth import Token
from schemas.user import UserCreate

# Precomputed hash so failed logins still do a verify() without hashing attacker input.
_DUMMY_PASSWORD_HASH = hash_password("invalid-password-placeholder")


async def register_user(db: AsyncSession, payload: UserCreate) -> User:
    validate_password_strength(payload.password)

    result = await db.execute(
        select(User).where(
            or_(User.email == payload.email, User.username == payload.username)
        )
    )
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered",
        )

    user = User(
        email=str(payload.email).lower(),
        username=payload.username,
        hashed_password=hash_password(payload.password),
        is_admin=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, username: str, password: str) -> Token:
    # OAuth2 "username" field accepts either login or email.
    identifier = username.strip()
    result = await db.execute(
        select(User).where(
            or_(User.username == identifier, User.email == identifier.lower())
        )
    )
    user = result.scalar_one_or_none()

    # Constant-ish failure path to reduce user enumeration timing signal.
    if user is None:
        verify_password(password, _DUMMY_PASSWORD_HASH)
        await asyncio.sleep(0.05)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    return Token(access_token=create_access_token(subject=user.username))
