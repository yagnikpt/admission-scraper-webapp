"""Schema models for Tag data."""

from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class TagBase(BaseModel):
    """Base schema for Tag data."""

    name: str


class TagResponse(TagBase):
    """Schema for responding with Tag data."""

    tag_id: UUID

    class Config:
        from_attributes = True
