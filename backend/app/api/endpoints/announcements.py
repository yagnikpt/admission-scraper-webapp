"""Announcement API endpoints."""

from datetime import date
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.expression import func

from app.db.models import Announcement, Program
from app.db.session import get_db
from app.schemas.announcement import AnnouncementResponse

router = APIRouter()


@router.get("", response_model=List[AnnouncementResponse])
def get_announcements(
    db: Session = Depends(get_db),
    limit: int = Query(25, description="Maximum number of announcements to return"),
    page: int = Query(1, description="Number of announcements to skip"),
    randomize: bool = Query(False, description="Whether to randomize the results"),
    categories: Optional[List[str]] = Query(
        None,
        description="Filter by program degree levels (repeat query param)",
    ),
    start_date: Optional[str] = Query(
        None,
        description="Filter by application_deadline >= YYYY-MM-DD",
    ),
    end_date: Optional[str] = Query(
        None,
        description="Filter by application_deadline <= YYYY-MM-DD",
    ),
):
    """
    Retrieve announcements with their related programs, institutions, states, and tags.

    Parameters:
    - limit: Maximum number of announcements to return (default: 25)
    - page: Number of announcements to skip (for pagination)
    - randomize: Whether to randomize the results (default: False, ordered by deadline: future dates closest first, then past dates most recent first)
    """
    try:
        offset = (page - 1) * limit if page > 0 else 0
        # Start building the query with eager loading of related entities
        query = db.query(Announcement).options(
            joinedload(Announcement.programs),
            joinedload(Announcement.institution),
            joinedload(Announcement.state),
            joinedload(Announcement.tags),
        )

        # Filter by categories (degree level)
        if categories:
            normalized_categories: List[str] = []
            for value in categories:
                normalized_categories.extend(
                    [part.strip() for part in value.split(",") if part.strip()]
                )
            if normalized_categories:
                query = query.filter(
                    Announcement.programs.any(
                        Program.degree_level.in_(normalized_categories)
                    )
                )

        # Filter by date range (application_deadline)
        if start_date:
            try:
                start_date_parsed = date.fromisoformat(start_date)
            except ValueError as exc:
                raise HTTPException(
                    status_code=400,
                    detail="start_date must be in YYYY-MM-DD format",
                ) from exc
            query = query.filter(Announcement.application_deadline >= start_date_parsed)
        if end_date:
            try:
                end_date_parsed = date.fromisoformat(end_date)
            except ValueError as exc:
                raise HTTPException(
                    status_code=400,
                    detail="end_date must be in YYYY-MM-DD format",
                ) from exc
            query = query.filter(Announcement.application_deadline <= end_date_parsed)

        # Apply ordering based on randomize parameter
        if randomize:
            query = query.order_by(func.random())
        else:
            # Order by deadline: future dates (closest first), then past dates (most recent first)
            today = date.today()
            query = query.order_by(
                case(
                    (
                        Announcement.application_deadline >= today,
                        Announcement.application_deadline,
                    ),
                    else_=None,
                ).asc(),
                case(
                    (
                        Announcement.application_deadline < today,
                        Announcement.application_deadline,
                    ),
                    else_=None,
                ).desc(),
            )

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
    page: int = Query(1, description="Number of announcements to skip"),
    randomize: bool = Query(False, description="Whether to randomize the results"),
    categories: Optional[List[str]] = Query(
        None,
        description="Filter by program degree levels (repeat query param)",
    ),
    start_date: Optional[str] = Query(
        None,
        description="Filter by application_deadline >= YYYY-MM-DD",
    ),
    end_date: Optional[str] = Query(
        None,
        description="Filter by application_deadline <= YYYY-MM-DD",
    ),
):
    """
    Retrieve announcements with announcement_type="admission_dates"
    and their related programs, institutions, states, and tags.

    Parameters:
    - limit: Maximum number of announcements to return (default: 25)
    - page: Number of announcements to skip (for pagination)
    - randomize: Whether to randomize the results (default: False, ordered by deadline: future dates closest first, then past dates most recent first)
    """
    try:
        offset = (page - 1) * limit if page > 0 else 0
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

        # Filter by categories (degree level)
        if categories:
            normalized_categories: List[str] = []
            for value in categories:
                normalized_categories.extend(
                    [part.strip() for part in value.split(",") if part.strip()]
                )
            if normalized_categories:
                query = query.filter(
                    Announcement.programs.any(
                        Program.degree_level.in_(normalized_categories)
                    )
                )

        # Filter by date range (application_deadline)
        if start_date:
            try:
                start_date_parsed = date.fromisoformat(start_date)
            except ValueError as exc:
                raise HTTPException(
                    status_code=400,
                    detail="start_date must be in YYYY-MM-DD format",
                ) from exc
            query = query.filter(Announcement.application_deadline >= start_date_parsed)
        if end_date:
            try:
                end_date_parsed = date.fromisoformat(end_date)
            except ValueError as exc:
                raise HTTPException(
                    status_code=400,
                    detail="end_date must be in YYYY-MM-DD format",
                ) from exc
            query = query.filter(Announcement.application_deadline <= end_date_parsed)

        # Apply ordering based on randomize parameter
        if randomize:
            query = query.order_by(func.random())
        else:
            # Order by deadline: future dates (closest first), then past dates (most recent first)
            today = date.today()
            query = query.order_by(
                case(
                    (
                        Announcement.application_deadline >= today,
                        Announcement.application_deadline,
                    ),
                    else_=None,
                ).asc(),
                case(
                    (
                        Announcement.application_deadline < today,
                        Announcement.application_deadline,
                    ),
                    else_=None,
                ).desc(),
            )

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
