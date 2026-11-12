import re

from fastapi import HTTPException, status

_LOWER = re.compile(r"[a-zа-яё]")
_UPPER = re.compile(r"[A-ZА-ЯЁ]")
_DIGIT = re.compile(r"\d")
_SYMBOL = re.compile(r"[^A-Za-zА-Яа-яЁё0-9]")


def validate_password_strength(password: str) -> None:
    errors: list[str] = []
    if len(password) < 8:
        errors.append("at least 8 characters")
    if not _LOWER.search(password):
        errors.append("a lowercase letter")
    if not _UPPER.search(password):
        errors.append("an uppercase letter")
    if not _DIGIT.search(password):
        errors.append("a digit")
    if not _SYMBOL.search(password):
        errors.append("a special character")

    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password must include: {', '.join(errors)}",
        )
