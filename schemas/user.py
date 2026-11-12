from datetime import datetime
import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


_USERNAME_RE = re.compile(r"^[a-zA-Z0-9_\.\-]{3,100}$")


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def username_safe(cls, value: str) -> str:
        value = value.strip()
        if not _USERNAME_RE.fullmatch(value):
            raise ValueError(
                "Username may contain letters, digits, underscore, dot and hyphen only"
            )
        return value


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    username: str
    is_active: bool
    is_admin: bool
    created_at: datetime
