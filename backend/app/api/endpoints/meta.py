"""Meta/status API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.models import ScrapedPage
from app.db.session import get_db

router = APIRouter()


@router.get("/last-scraped")
def get_last_scraped(db: Session = Depends(get_db)):
    """
    Return the most recent last_scraped timestamp from the scraped_pages table.
    """
    try:
        result = db.query(func.max(ScrapedPage.last_scraped)).scalar()
        return {"last_scraped": result.isoformat() if result else None}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching last scraped date: {str(e)}"
        )
