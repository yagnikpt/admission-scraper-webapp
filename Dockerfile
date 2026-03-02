# =============================================================================
# Stage 1: Build the frontend with Bun
# =============================================================================
FROM oven/bun:1 AS frontend-build

WORKDIR /app

# Copy workspace root files needed for dependency resolution
COPY package.json bun.lock ./
COPY frontend/package.json ./frontend/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy frontend source and build
COPY frontend/ ./frontend/
RUN bun run --filter frontend build

# =============================================================================
# Stage 2: Python backend + built frontend
# =============================================================================
FROM python:3.12-slim

WORKDIR /code

# Install system dependencies for SSL connections to Neon PostgreSQL
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy backend application code
COPY backend/app ./app

# Copy built frontend from stage 1
COPY --from=frontend-build /app/frontend/dist ./static

# Tell FastAPI where to find the frontend build
ENV STATIC_DIR=/code/static
ENV ENVIRONMENT=production

EXPOSE 8000

CMD ["fastapi", "run", "--host", "0.0.0.0", "--port", "8000"]
