"""Database session management module."""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment variable
DB_URL = os.environ.get("DB_URL")
if DB_URL is None:
    raise ValueError("DB_URL environment variable is not set")

# Determine if we're in production environment (e.g., on render.com)
IS_PRODUCTION = os.environ.get("ENVIRONMENT") == "production"

# Choose appropriate engine based on environment
if IS_PRODUCTION:
    # Use production-optimized engine with IPv4 enforcement
    from app.db.connection import get_production_engine

    engine = get_production_engine(DB_URL)
else:
    # Use regular engine for local development
    from sqlalchemy import create_engine

    engine = create_engine(DB_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
