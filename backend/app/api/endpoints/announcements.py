"""Announcement API endpoints."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.expression import func

from ...db.models import Announcement, Program, Tag
from ...db.session import get_db
from ...schemas.announcement import AnnouncementResponse, PaginatedAnnouncementResponse

router = APIRouter()

EXCLUDED_GENERAL_TYPES = ["admission_dates", "exam_info", "result_info"]


def _normalize_list_param(values: list[str] | None) -> list[str]:
    if not values:
        return []

    normalized: list[str] = []
    for value in values:
        normalized.extend([part.strip() for part in value.split(",") if part.strip()])
    return normalized


def _apply_common_filters(
    base_query,
    categories: list[str] | None,
    start_date: str | None,
    end_date: str | None,
    state_ids: list[str] | None,
    tag_ids: list[str] | None = None,
):
    normalized_categories = _normalize_list_param(categories)
    if normalized_categories:
        base_query = base_query.filter(
            Announcement.programs.any(Program.degree_level.in_(normalized_categories))
        )

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

    normalized_state_ids = _normalize_list_param(state_ids)
    if normalized_state_ids:
        base_query = base_query.filter(Announcement.state_id.in_(normalized_state_ids))

    normalized_tag_ids = _normalize_list_param(tag_ids)
    if normalized_tag_ids:
        base_query = base_query.filter(
            Announcement.tags.any(Tag.tag_id.in_(normalized_tag_ids))
        )

    return base_query


def _build_paginated_response(base_query, page: int, limit: int, randomize: bool):
    offset = (page - 1) * limit if page > 0 else 0
    total = base_query.count()

    query = base_query.options(
        joinedload(Announcement.programs),
        joinedload(Announcement.institution),
        joinedload(Announcement.state),
        joinedload(Announcement.tags),
    )

    if randomize:
        query = query.order_by(func.random())
    else:
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

    announcements = query.offset(offset).limit(limit).all()

    return {
        "items": announcements,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get("", response_model=PaginatedAnnouncementResponse)
def get_announcements(
    db: Session = Depends(get_db),
    limit: int = Query(20, description="Maximum number of announcements to return"),
    page: int = Query(1, description="Page number (1-indexed)"),
    randomize: bool = Query(False, description="Whether to randomize the results"),
    categories: list[str] | None = Query(
        None,
        description="Filter by program degree levels (repeat query param)",
    ),
    start_date: str | None = Query(
        None,
        description="Filter by application_deadline >= YYYY-MM-DD",
    ),
    end_date: str | None = Query(
        None,
        description="Filter by application_deadline <= YYYY-MM-DD",
    ),
    state_ids: list[str] | None = Query(
        None,
        description="Filter by state UUIDs (comma-separated or repeated)",
    ),
    tag_ids: list[str] | None = Query(
        None,
        description="Filter by tag UUIDs (comma-separated or repeated)",
    ),
):
    """Retrieve all non-special announcements with filters and pagination."""
    try:
        base_query = db.query(Announcement).filter(
            Announcement.announcement_type.notin_(EXCLUDED_GENERAL_TYPES)
        )

        base_query = _apply_common_filters(
            base_query=base_query,
            categories=categories,
            start_date=start_date,
            end_date=end_date,
            state_ids=state_ids,
            tag_ids=tag_ids,
        )

        return _build_paginated_response(base_query, page, limit, randomize)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Error fetching announcements: {str(exc)}"
        )


@router.get("/admission-dates", response_model=PaginatedAnnouncementResponse)
def get_admission_dates_announcements(
    db: Session = Depends(get_db),
    limit: int = Query(20, description="Maximum number of announcements to return"),
    page: int = Query(1, description="Page number (1-indexed)"),
    randomize: bool = Query(False, description="Whether to randomize the results"),
    categories: list[str] | None = Query(
        None,
        description="Filter by program degree levels (repeat query param)",
    ),
    start_date: str | None = Query(
        None,
        description="Filter by application_deadline >= YYYY-MM-DD",
    ),
    end_date: str | None = Query(
        None,
        description="Filter by application_deadline <= YYYY-MM-DD",
    ),
    state_ids: list[str] | None = Query(
        None,
        description="Filter by state UUIDs (comma-separated or repeated)",
    ),
    has_deadline: bool = Query(
        False,
        description="Only include items that have application_deadline",
    ),
):
    """Retrieve announcements with announcement_type='admission_dates'."""
    try:
        base_query = db.query(Announcement).filter(
            Announcement.announcement_type == "admission_dates"
        )

        if has_deadline:
            base_query = base_query.filter(
                Announcement.application_deadline.isnot(None)
            )

        base_query = _apply_common_filters(
            base_query=base_query,
            categories=categories,
            start_date=start_date,
            end_date=end_date,
            state_ids=state_ids,
            tag_ids=None,
        )

        return _build_paginated_response(base_query, page, limit, randomize)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching admission dates announcements: {str(exc)}",
        )


@router.get("/exam-info", response_model=PaginatedAnnouncementResponse)
def get_exam_info_announcements(
    db: Session = Depends(get_db),
    limit: int = Query(20, description="Maximum number of announcements to return"),
    page: int = Query(1, description="Page number (1-indexed)"),
    randomize: bool = Query(False, description="Whether to randomize the results"),
    categories: list[str] | None = Query(
        None,
        description="Filter by program degree levels (repeat query param)",
    ),
    start_date: str | None = Query(
        None,
        description="Filter by application_deadline >= YYYY-MM-DD",
    ),
    end_date: str | None = Query(
        None,
        description="Filter by application_deadline <= YYYY-MM-DD",
    ),
    state_ids: list[str] | None = Query(
        None,
        description="Filter by state UUIDs (comma-separated or repeated)",
    ),
):
    """Retrieve announcements with announcement_type='exam_info'."""
    try:
        base_query = db.query(Announcement).filter(
            Announcement.announcement_type == "exam_info"
        )

        base_query = _apply_common_filters(
            base_query=base_query,
            categories=categories,
            start_date=start_date,
            end_date=end_date,
            state_ids=state_ids,
            tag_ids=None,
        )

        return _build_paginated_response(base_query, page, limit, randomize)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching exam info announcements: {str(exc)}",
        )


@router.get("/result-info", response_model=PaginatedAnnouncementResponse)
def get_result_info_announcements(
    db: Session = Depends(get_db),
    limit: int = Query(20, description="Maximum number of announcements to return"),
    page: int = Query(1, description="Page number (1-indexed)"),
    randomize: bool = Query(False, description="Whether to randomize the results"),
    categories: list[str] | None = Query(
        None,
        description="Filter by program degree levels (repeat query param)",
    ),
    start_date: str | None = Query(
        None,
        description="Filter by application_deadline >= YYYY-MM-DD",
    ),
    end_date: str | None = Query(
        None,
        description="Filter by application_deadline <= YYYY-MM-DD",
    ),
    state_ids: list[str] | None = Query(
        None,
        description="Filter by state UUIDs (comma-separated or repeated)",
    ),
):
    """Retrieve announcements with announcement_type='result_info'."""
    try:
        base_query = db.query(Announcement).filter(
            Announcement.announcement_type == "result_info"
        )

        base_query = _apply_common_filters(
            base_query=base_query,
            categories=categories,
            start_date=start_date,
            end_date=end_date,
            state_ids=state_ids,
            tag_ids=None,
        )

        return _build_paginated_response(base_query, page, limit, randomize)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching result info announcements: {str(exc)}",
        )


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement(announcement_id: UUID, db: Session = Depends(get_db)):
    """Retrieve a specific announcement by ID with related entities."""
    try:
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
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Error fetching announcement: {str(exc)}"
        )
