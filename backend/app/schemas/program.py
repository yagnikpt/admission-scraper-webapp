"""Schema models for Program data."""

from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class ProgramBase(BaseModel):
    """Base schema for Program data."""

    name: str
    description: Optional[str] = None
    degree_level: Optional[str] = None
    duration_months: Optional[int] = None


class ProgramResponse(ProgramBase):
    """Schema for responding with Program data."""

    program_id: UUID

    class Config:
        from_attributes = True
