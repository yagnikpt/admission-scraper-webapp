"""Announcement API endpoints."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.expression import func

from app.db.session import get_db
from app.db.models import Announcement
from app.schemas.announcement import AnnouncementResponse

router = APIRouter()


@router.get("/", response_model=List[AnnouncementResponse])
def get_announcements(
    db: Session = Depends(get_db),
    limit: int = Query(25, description="Maximum number of announcements to return"),
    offset: int = Query(0, description="Number of announcements to skip"),
    randomize: bool = Query(False, description="Whether to randomize the results"),
):
    """
    Retrieve announcements with their related programs, institutions, states, and tags.

    Parameters:
    - limit: Maximum number of announcements to return (default: 25)
    - offset: Number of announcements to skip (for pagination)
    - randomize: Whether to randomize the results (default: False, ordered by updated_at desc)
    """
    try:
        # Start building the query with eager loading of related entities
        query = db.query(Announcement).options(
            joinedload(Announcement.programs),
            joinedload(Announcement.institution),
            joinedload(Announcement.state),
            joinedload(Announcement.tags),
        )

        # Apply ordering based on randomize parameter
        if randomize:
            query = query.order_by(func.random())
        else:
            query = query.order_by(Announcement.updated_at.desc())

        # Apply pagination
        query = query.offset(offset).limit(limit)

        # Execute the query
        announcements = query.all()

        return announcements

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching announcements: {str(e)}"
        )


@router.get("/admission-dates", response_model=List[AnnouncementResponse])
def get_admission_dates_announcements(
    db: Session = Depends(get_db),
    limit: int = Query(25, description="Maximum number of announcements to return"),
    offset: int = Query(0, description="Number of announcements to skip"),
    randomize: bool = Query(False, description="Whether to randomize the results"),
):
    """
    Retrieve announcements with announcement_type="admission_dates"
    and their related programs, institutions, states, and tags.

    Parameters:
    - limit: Maximum number of announcements to return (default: 25)
    - offset: Number of announcements to skip (for pagination)
    - randomize: Whether to randomize the results (default: False, ordered by updated_at desc)
    """
    try:
        # Start building the query with eager loading of related entities
        query = (
            db.query(Announcement)
            .options(
                joinedload(Announcement.programs),
                joinedload(Announcement.institution),
                joinedload(Announcement.state),
                joinedload(Announcement.tags),
            )
            .filter(Announcement.announcement_type == "admission_dates")
        )

        # Apply ordering based on randomize parameter
        if randomize:
            query = query.order_by(func.random())
        else:
            query = query.order_by(Announcement.updated_at.desc())

        # Apply pagination
        query = query.offset(offset).limit(limit)

        # Execute the query
        announcements = query.all()

        return announcements

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching admission dates announcements: {str(e)}",
        )


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement(announcement_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieve a specific announcement by ID with its related programs, institution, state, and tags
    """
    try:
        # Fetch the specific announcement with eager loading of related entities
        announcement = (
            db.query(Announcement)
            .options(
                joinedload(Announcement.programs),
                joinedload(Announcement.institution),
                joinedload(Announcement.state),
                joinedload(Announcement.tags),
            )
            .filter(Announcement.announcement_id == announcement_id)
            .first()
        )

        if not announcement:
            raise HTTPException(status_code=404, detail="Announcement not found")

        return announcement

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching announcement: {str(e)}"
        )
