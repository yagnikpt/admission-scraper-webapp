"""Schema models for Institution and State data."""

from uuid import UUID

from pydantic import BaseModel


class StateBase(BaseModel):
    """Base schema for State data."""

    name: str
    abbreviation: str


class StateResponse(StateBase):
    """Schema for responding with State data."""

    state_id: UUID

    class Config:
        from_attributes = True


class InstitutionBase(BaseModel):
    """Base schema for Institution data."""

    name: str
    website: str
    description: str | None = None
    state_id: UUID | None = None


class InstitutionResponse(InstitutionBase):
    """Schema for responding with Institution data."""

    institution_id: UUID
    state: StateResponse | None = None

    class Config:
        from_attributes = True
