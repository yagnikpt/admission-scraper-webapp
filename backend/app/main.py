"""Main application module."""

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from .api.api import api_router

# Resolve the frontend dist directory.
# In Docker, the built frontend is copied to /code/static.
# For local dev, fall back to ../frontend/dist relative to the backend dir.
STATIC_DIR = Path(
    os.getenv(
        "STATIC_DIR",
        Path(__file__).resolve().parent.parent / ".." / "frontend" / "dist",
    )
)


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
        redirect_slashes=False,
    )

    # Configure CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, restrict this to specific origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API router (must be registered before the static/SPA catch-all)
    application.include_router(api_router, prefix="/api")

    # Serve frontend static files if the dist directory exists
    static_dir = Path(STATIC_DIR)
    if static_dir.is_dir():
        # Mount static assets (JS, CSS, images)
        assets_dir = static_dir / "assets"
        if assets_dir.is_dir():
            application.mount(
                "/assets",
                StaticFiles(directory=str(assets_dir)),
                name="static-assets",
            )

        # Serve all root-level static files (e.g. favicon, vite.svg, og-image.jpg)
        # Dynamically register routes for every file in the static directory root
        for static_file_path in static_dir.iterdir():
            if static_file_path.is_file() and static_file_path.name != "index.html":
                route_path = f"/{static_file_path.name}"

                def _make_handler(fpath: Path):
                    async def serve_static_file():
                        return FileResponse(str(fpath))

                    return serve_static_file

                application.get(route_path)(_make_handler(static_file_path))

        # SPA catch-all: serve index.html for client-side routes.
        # This is added as an exception handler so it only fires when
        # no other route matched -- avoiding conflicts with /api routes.
        index_html = static_dir / "index.html"

        @application.exception_handler(404)
        async def spa_fallback(request: Request, _exc):
            # Only serve the SPA for non-API, non-docs GET requests
            if request.method == "GET" and not request.url.path.startswith(
                ("/api", "/docs", "/redoc", "/openapi.json")
            ):
                return FileResponse(str(index_html))
            return HTMLResponse(status_code=404)

    return application


app = create_application()
