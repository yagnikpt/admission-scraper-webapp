"""Schema models for Program data."""

from uuid import UUID

from pydantic import BaseModel


class ProgramBase(BaseModel):
    """Base schema for Program data."""

    name: str
    description: str | None = None
    degree_level: str | None = None
    duration_months: int | None = None


class ProgramResponse(ProgramBase):
    """Schema for responding with Program data."""

    program_id: UUID

    class Config:
        from_attributes = True
