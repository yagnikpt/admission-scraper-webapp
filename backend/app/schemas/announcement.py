"""Schema models for Announcement data."""

from typing import Optional, List
from datetime import date
from uuid import UUID
from pydantic import BaseModel

from app.schemas.program import ProgramResponse
from app.schemas.institution import InstitutionResponse, StateResponse
from app.schemas.tag import TagResponse


class AnnouncementBase(BaseModel):
    """Base schema for Announcement data."""

    title: str
    content: str
    url: str
    institution_id: Optional[UUID] = None
    state_id: Optional[UUID] = None
    published_date: Optional[date] = None
    application_open_date: Optional[date] = None
    application_deadline: Optional[date] = None
    term: Optional[str] = None
    contact_info: Optional[str] = None
    announcement_type: Optional[str] = None


class AnnouncementCreate(AnnouncementBase):
    """Schema for creating a new Announcement."""

    pass


class AnnouncementResponse(AnnouncementBase):
    """Schema for responding with Announcement data."""

    announcement_id: UUID
    programs: List[ProgramResponse] = []
    institution: Optional[InstitutionResponse] = None
    state: Optional[StateResponse] = None
    tags: List[TagResponse] = []  # Add tags to the response

    class Config:
        from_attributes = True
