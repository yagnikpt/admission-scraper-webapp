"""Main application module."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api.api import api_router


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Returns:
        FastAPI: Configured FastAPI application
    """
    load_dotenv()
    # Create FastAPI app
    application = FastAPI(
        title="Admissions API",
        description="API for accessing admission announcements and related programs",
        version="0.1.0",
    )

    # Configure CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, restrict this to specific origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.get("/")
    def hello():
        return "Hello."

    # Include API router
    application.include_router(api_router, prefix="/api")

    return application


app = create_application()
