"""Announcement API endpoints."""

from datetime import date
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.expression import func

from app.db.models import Announcement, Program, Tag
from app.db.session import get_db
from app.schemas.announcement import AnnouncementResponse, PaginatedAnnouncementResponse

router = APIRouter()


@router.get("", response_model=PaginatedAnnouncementResponse)
def get_announcements(
    db: Session = Depends(get_db),
    limit: int = Query(20, description="Maximum number of announcements to return"),
    page: int = Query(1, description="Page number (1-indexed)"),
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
    state_ids: Optional[List[str]] = Query(
        None,
        description="Filter by state UUIDs (comma-separated or repeated)",
    ),
    tag_ids: Optional[List[str]] = Query(
        None,
        description="Filter by tag UUIDs (comma-separated or repeated)",
    ),
):
    """
    Retrieve announcements with their related programs, institutions, states, and tags.

    Parameters:
    - limit: Maximum number of announcements to return (default: 20)
    - page: Page number, 1-indexed (default: 1)
    - randomize: Whether to randomize the results (default: False, ordered by deadline: future dates closest first, then past dates most recent first)
    """
    try:
        offset = (page - 1) * limit if page > 0 else 0
        # Base filter query (without eager loads) for counting
        base_query = db.query(Announcement).filter(
            Announcement.announcement_type != "admission_dates"
        )

        # Filter by categories (degree level)
        if categories:
            normalized_categories: List[str] = []
            for value in categories:
                normalized_categories.extend(
                    [part.strip() for part in value.split(",") if part.strip()]
                )
            if normalized_categories:
                base_query = base_query.filter(
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
            base_query = base_query.filter(
                Announcement.application_deadline >= start_date_parsed
            )
        if end_date:
            try:
                end_date_parsed = date.fromisoformat(end_date)
            except ValueError as exc:
                raise HTTPException(
                    status_code=400,
                    detail="end_date must be in YYYY-MM-DD format",
                ) from exc
            base_query = base_query.filter(
                Announcement.application_deadline <= end_date_parsed
            )

        # Filter by state IDs
        if state_ids:
            normalized_state_ids: List[str] = []
            for value in state_ids:
                normalized_state_ids.extend(
                    [part.strip() for part in value.split(",") if part.strip()]
                )
            if normalized_state_ids:
                base_query = base_query.filter(
                    Announcement.state_id.in_(normalized_state_ids)
                )

        # Filter by tag IDs
        if tag_ids:
            normalized_tag_ids: List[str] = []
            for value in tag_ids:
                normalized_tag_ids.extend(
                    [part.strip() for part in value.split(",") if part.strip()]
                )
            if normalized_tag_ids:
                base_query = base_query.filter(
                    Announcement.tags.any(
                        Tag.tag_id.in_(normalized_tag_ids)
                    )
                )

        # Get total count before pagination
        total = base_query.count()

        # Add eager loading for the actual data query
        query = base_query.options(
            joinedload(Announcement.programs),
            joinedload(Announcement.institution),
            joinedload(Announcement.state),
            joinedload(Announcement.tags),
        )

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

        return {
            "items": announcements,
            "total": total,
            "page": page,
            "limit": limit,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching announcements: {str(e)}"
        )


@router.get("/admission-dates", response_model=PaginatedAnnouncementResponse)
def get_admission_dates_announcements(
    db: Session = Depends(get_db),
    limit: int = Query(20, description="Maximum number of announcements to return"),
    page: int = Query(1, description="Page number (1-indexed)"),
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
    state_ids: Optional[List[str]] = Query(
        None,
        description="Filter by state UUIDs (comma-separated or repeated)",
    ),
):
    """
    Retrieve announcements with announcement_type="admission_dates"
    and their related programs, institutions, states, and tags.

    Parameters:
    - limit: Maximum number of announcements to return (default: 20)
    - page: Page number, 1-indexed (default: 1)
    - randomize: Whether to randomize the results (default: False, ordered by deadline: future dates closest first, then past dates most recent first)
    """
    try:
        offset = (page - 1) * limit if page > 0 else 0
        # Base filter query (without eager loads) for counting
        base_query = db.query(Announcement).filter(
            Announcement.announcement_type == "admission_dates"
        )

        # Filter by categories (degree level)
        if categories:
            normalized_categories: List[str] = []
            for value in categories:
                normalized_categories.extend(
                    [part.strip() for part in value.split(",") if part.strip()]
                )
            if normalized_categories:
                base_query = base_query.filter(
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
            base_query = base_query.filter(
                Announcement.application_deadline >= start_date_parsed
            )
        if end_date:
            try:
                end_date_parsed = date.fromisoformat(end_date)
            except ValueError as exc:
                raise HTTPException(
                    status_code=400,
                    detail="end_date must be in YYYY-MM-DD format",
                ) from exc
            base_query = base_query.filter(
                Announcement.application_deadline <= end_date_parsed
            )

        # Filter by state IDs
        if state_ids:
            normalized_state_ids: List[str] = []
            for value in state_ids:
                normalized_state_ids.extend(
                    [part.strip() for part in value.split(",") if part.strip()]
                )
            if normalized_state_ids:
                base_query = base_query.filter(
                    Announcement.state_id.in_(normalized_state_ids)
                )

        # Get total count before pagination
        total = base_query.count()

        # Add eager loading for the actual data query
        query = base_query.options(
            joinedload(Announcement.programs),
            joinedload(Announcement.institution),
            joinedload(Announcement.state),
            joinedload(Announcement.tags),
        )

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

        return {
            "items": announcements,
            "total": total,
            "page": page,
            "limit": limit,
        }

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
