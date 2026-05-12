"""Direct PostgreSQL connection helper for production environments."""

import socket
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy import create_engine, event


def _sanitize_db_url(db_url: str) -> str:
    """
    Strip connection parameters that psycopg2-binary's bundled libpq
    doesn't support (e.g. channel_binding). These params cause
    'server closed the connection unexpectedly' errors in Docker.
    """
    parsed = urlparse(db_url)
    params = parse_qs(parsed.query)
    params.pop("channel_binding", None)
    cleaned_query = urlencode(params, doseq=True)
    return urlunparse(parsed._replace(query=cleaned_query))


def get_production_engine(db_url: str):
    """
    Create a production-ready SQLAlchemy engine with optimized settings
    specifically for render.com and Neon.

    This enforces IPv4 connections by using socket options and
    ensures proper SSL configuration.
    """
    db_url = _sanitize_db_url(db_url)

    # Force socket.getaddrinfo to return IPv4 addresses only
    # This is the most direct way to force IPv4 for all connections
    original_getaddrinfo = socket.getaddrinfo

    def getaddrinfo_ipv4_only(*args, **kwargs):
        # Force IPv4 by setting family=socket.AF_INET
        return original_getaddrinfo(*args, family=socket.AF_INET, **kwargs)

    # Replace the system's getaddrinfo with our IPv4-only version
    socket.getaddrinfo = getaddrinfo_ipv4_only

    # Create SQLAlchemy engine with production settings
    engine = create_engine(
        db_url,
        connect_args={
            "sslmode": "require",
            "connect_timeout": 30,
            "application_name": "admissions_api_production",
        },
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=1800,
        pool_pre_ping=True,
    )

    # Add event listener to verify connections work before using them
    @event.listens_for(engine, "connect")
    def connect(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("SELECT 1")
        cursor.close()

    return engine
