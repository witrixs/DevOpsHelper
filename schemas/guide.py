from datetime import datetime
import re

from pydantic import BaseModel, ConfigDict, Field, field_validator

_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class GuideCreate(BaseModel):
    slug: str = Field(min_length=2, max_length=120)
    title: str = Field(min_length=2, max_length=200)
    blurb: str = Field(default="", max_length=300)
    description: str = Field(default="", max_length=500)
    content: str = Field(default="", max_length=200_000)
    group_name: str = Field(default="Общее", max_length=100)
    read_time: str = Field(default="5 мин", max_length=40)
    is_published: bool = False

    @field_validator("slug")
    @classmethod
    def slug_safe(cls, value: str) -> str:
        value = value.strip().lower()
        if not _SLUG_RE.fullmatch(value):
            raise ValueError("Slug must be lowercase kebab-case (e.g. docker-compose)")
        return value


class GuideUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=2, max_length=120)
    title: str | None = Field(default=None, min_length=2, max_length=200)
    blurb: str | None = Field(default=None, max_length=300)
    description: str | None = Field(default=None, max_length=500)
    content: str | None = Field(default=None, max_length=200_000)
    group_name: str | None = Field(default=None, max_length=100)
    read_time: str | None = Field(default=None, max_length=40)
    is_published: bool | None = None

    @field_validator("slug")
    @classmethod
    def slug_safe(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip().lower()
        if not _SLUG_RE.fullmatch(value):
            raise ValueError("Slug must be lowercase kebab-case (e.g. docker-compose)")
        return value


class GuideOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    blurb: str
    description: str
    content: str
    group_name: str
    read_time: str
    is_published: bool
    author_id: int
    created_at: datetime
    updated_at: datetime


class GuideListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    blurb: str
    description: str
    group_name: str
    read_time: str
    is_published: bool
    author_id: int
    created_at: datetime
    updated_at: datetime
