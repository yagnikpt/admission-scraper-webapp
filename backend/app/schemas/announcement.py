"""Schema models for Announcement data."""

from datetime import date
from uuid import UUID

from pydantic import BaseModel

from .institution import InstitutionResponse, StateResponse
from .program import ProgramResponse
from .tag import TagResponse


class AnnouncementBase(BaseModel):
    """Base schema for Announcement data."""

    title: str
    content: str
    url: str
    institution_id: UUID | None = None
    state_id: UUID | None = None
    published_date: date | None = None
    application_open_date: date | None = None
    application_deadline: date | None = None
    term: str | None = None
    contact_info: str | None = None
    announcement_type: str | None = None


class AnnouncementCreate(AnnouncementBase):
    """Schema for creating a new Announcement."""

    pass


class AnnouncementResponse(AnnouncementBase):
    """Schema for responding with Announcement data."""

    announcement_id: UUID
    programs: list[ProgramResponse] = []
    institution: InstitutionResponse | None = None
    state: StateResponse | None = None
    tags: list[TagResponse] = []  # Add tags to the response

    class Config:
        from_attributes = True


class PaginatedAnnouncementResponse(BaseModel):
    """Paginated wrapper for announcement lists."""

    items: list[AnnouncementResponse]
    total: int
    page: int
    limit: int
