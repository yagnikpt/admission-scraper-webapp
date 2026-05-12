"""init

Revision ID: 9830ac4acff6
Revises:
Create Date: 2026-04-29 17:54:58.332198

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "9830ac4acff6"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "states",
        sa.Column("state_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("abbreviation", sa.String(length=2), nullable=False),
        sa.PrimaryKeyConstraint("state_id"),
        sa.UniqueConstraint("abbreviation"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "programs",
        sa.Column("program_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("degree_level", sa.String(), nullable=True),
        sa.Column("duration_months", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("program_id"),
    )

    op.create_table(
        "tags",
        sa.Column("tag_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("tag_id"),
    )

    op.create_table(
        "scraped_pages",
        sa.Column("scraped_page_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("url", sa.String(length=255), nullable=False),
        sa.Column("site", sa.String(length=255), nullable=True),
        sa.Column("last_scraped", sa.DateTime(), nullable=False),
        sa.Column("content_hash", sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint("scraped_page_id"),
    )

    op.create_table(
        "institutions",
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("website", sa.String(), nullable=False),
        sa.Column("state_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["state_id"], ["states.state_id"]),
        sa.PrimaryKeyConstraint("institution_id"),
        sa.UniqueConstraint("website"),
    )

    op.create_table(
        "announcements",
        sa.Column("announcement_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("state_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("published_date", sa.Date(), nullable=True),
        sa.Column("application_open_date", sa.Date(), nullable=True),
        sa.Column("application_deadline", sa.Date(), nullable=True),
        sa.Column("term", sa.String(), nullable=True),
        sa.Column("contact_info", sa.Text(), nullable=True),
        sa.Column("announcement_type", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("search_vector", postgresql.TSVECTOR(), nullable=True),
        sa.Column("scraped_page_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(["institution_id"], ["institutions.institution_id"]),
        sa.ForeignKeyConstraint(
            ["scraped_page_id"], ["scraped_pages.scraped_page_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["state_id"], ["states.state_id"]),
        sa.PrimaryKeyConstraint("announcement_id"),
    )

    op.create_table(
        "program_announcements",
        sa.Column("program_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("announcement_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["announcement_id"], ["announcements.announcement_id"]),
        sa.ForeignKeyConstraint(["program_id"], ["programs.program_id"]),
        sa.PrimaryKeyConstraint("program_id", "announcement_id"),
    )

    op.create_table(
        "announcement_tags",
        sa.Column("announcement_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tag_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["announcement_id"], ["announcements.announcement_id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.tag_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("announcement_id", "tag_id"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("announcement_tags")
    op.drop_table("program_announcements")
    op.drop_table("announcements")
    op.drop_table("institutions")
    op.drop_table("scraped_pages")
    op.drop_table("tags")
    op.drop_table("programs")
    op.drop_table("states")
