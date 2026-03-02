# Admission Scraper

Full-stack application for browsing admission announcements, deadlines, and program details from educational institutions.

## Stack

**Backend** -- FastAPI, SQLAlchemy, PostgreSQL, Pydantic
**Frontend** -- React 19, TypeScript, Vite, TailwindCSS, TanStack Query, Zod

The FastAPI backend serves both the API and the built frontend as a single deployment unit.

## Getting Started

### Prerequisites

- Python 3.12+
- [Bun](https://bun.sh) (or Node.js)
- PostgreSQL database

### Environment

```
cp backend/.env.example backend/.env
```

Set `DB_URL` to your PostgreSQL connection string.

### Local Development

```bash
# backend
uv sync
fastapi dev

# frontend (separate terminal)
bun install
bun run dev
```

The Vite dev server proxies `/api` requests to `localhost:8000` automatically.

### Docker

```bash
docker build -t admission-scraper .
docker run -p 8000:8000 -e DB_URL=<your-connection-string> admission-scraper
```

Everything runs on port `8000` -- API and frontend.

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/announcements` | List announcements (paginated) |
| `GET` | `/api/announcements/admission-dates` | Admission-type announcements |
| `GET` | `/api/announcements/{id}` | Single announcement by ID |

Query params: `limit`, `offset`, `randomize`

Interactive docs available at `/docs` when running.

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/endpoints/   # Route handlers
│   │   ├── db/              # Models, sessions, connection
│   │   ├── schemas/         # Pydantic response models
│   │   └── app.py           # FastAPI application + SPA serving
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route pages
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Data fetching hooks
│   │   └── lib/             # API routes, schemas, utilities
│   ├── vite.config.ts
│   └── package.json
└── Dockerfile               # Multi-stage build (Bun + Python)
```
