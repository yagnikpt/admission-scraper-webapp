"""Main API router that includes all endpoint routers."""

from fastapi import APIRouter

from app.api.endpoints import announcements

# Create main API router
api_router = APIRouter()

# Include routers for different resources
api_router.include_router(
    announcements.router, prefix="/announcements", tags=["announcements"]
)
