"""Database models for the application."""

from sqlalchemy import Column, String, Text, Date, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.session import Base


class State(Base):
    """Database model for states."""

    __tablename__ = "states"

    state_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, unique=True)
    abbreviation = Column(String(2), nullable=False, unique=True)

    # Define relationships
    institutions = relationship("Institution", back_populates="state")
    announcements = relationship("Announcement", back_populates="state")


class Institution(Base):
    """Database model for institutions."""

    __tablename__ = "institutions"

    institution_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    website = Column(String, nullable=False, unique=True)
    state_id = Column(UUID(as_uuid=True), ForeignKey("states.state_id"), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(Date, nullable=True)
    updated_at = Column(Date, nullable=True)

    # Define relationships
    state = relationship("State", back_populates="institutions")
    announcements = relationship("Announcement", back_populates="institution")


class Program(Base):
    """Database model for programs."""

    __tablename__ = "programs"

    program_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    degree_level = Column(String, nullable=True)
    duration_months = Column(Integer, nullable=True)
    created_at = Column(Date, nullable=True)
    updated_at = Column(Date, nullable=True)

    # Define relationship to announcements
    announcements = relationship(
        "Announcement", secondary="program_announcements", back_populates="programs"
    )


class Tag(Base):
    """Database model for tags."""

    __tablename__ = "tags"

    tag_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False)

    # Define relationship to announcements
    announcements = relationship(
        "Announcement", secondary="announcement_tags", back_populates="tags"
    )


class Announcement(Base):
    """Database model for announcements."""

    __tablename__ = "announcements"

    announcement_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    url = Column(String, nullable=False)
    institution_id = Column(
        UUID(as_uuid=True), ForeignKey("institutions.institution_id"), nullable=True
    )
    state_id = Column(UUID(as_uuid=True), ForeignKey("states.state_id"), nullable=True)
    published_date = Column(Date, nullable=True)
    application_open_date = Column(Date, nullable=True)
    application_deadline = Column(Date, nullable=True)
    term = Column(String, nullable=True)
    contact_info = Column(Text, nullable=True)
    announcement_type = Column(String, nullable=True)
    created_at = Column(Date, nullable=True)
    updated_at = Column(Date, nullable=True)

    # Define relationships
    programs = relationship(
        "Program", secondary="program_announcements", back_populates="announcements"
    )
    institution = relationship("Institution", back_populates="announcements")
    state = relationship("State", back_populates="announcements")
    # Add relationship to tags
    tags = relationship(
        "Tag", secondary="announcement_tags", back_populates="announcements"
    )


class ProgramAnnouncement(Base):
    """Database model for the program_announcements junction table."""

    __tablename__ = "program_announcements"

    program_id = Column(
        UUID(as_uuid=True), ForeignKey("programs.program_id"), primary_key=True
    )
    announcement_id = Column(
        UUID(as_uuid=True),
        ForeignKey("announcements.announcement_id"),
        primary_key=True,
    )


class AnnouncementTag(Base):
    """Database model for the announcement_tags junction table."""

    __tablename__ = "announcement_tags"

    announcement_id = Column(
        UUID(as_uuid=True),
        ForeignKey("announcements.announcement_id", ondelete="CASCADE"),
        primary_key=True,
    )
    tag_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tags.tag_id", ondelete="CASCADE"),
        primary_key=True,
    )
