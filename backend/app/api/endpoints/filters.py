"""Filter-related API endpoints (states, tags)."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.models import State, Tag
from app.db.session import get_db
from app.schemas.institution import StateResponse
from app.schemas.tag import TagResponse

router = APIRouter()


@router.get("/states", response_model=List[StateResponse])
def get_states(db: Session = Depends(get_db)):
    """Retrieve all states, ordered alphabetically by name."""
    try:
        states = db.query(State).order_by(State.name.asc()).all()
        return states
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching states: {str(e)}"
        )


@router.get("/tags", response_model=List[TagResponse])
def get_tags(db: Session = Depends(get_db)):
    """Retrieve all tags, ordered alphabetically by name."""
    try:
        tags = db.query(Tag).order_by(Tag.name.asc()).all()
        return tags
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching tags: {str(e)}"
        )
