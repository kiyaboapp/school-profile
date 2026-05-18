# ShuleYetu — Tanzania Education Data Platform

Complete Next.js 14+ frontend with FastAPI backend for Tanzania school selections, results, and analytics.

## Architecture

### Frontend (Next.js 14+)
- **App Router** with Server Components
- **TypeScript** strict mode
- **Tailwind CSS** with dark mode support
- **Mobile-first** responsive design

### Backend (FastAPI)
- **Pydantic schemas** mirroring SQLAlchemy models
- **Service layer** for business logic
- **RESTful API** at `/api/v1`
- **CORS enabled** for Next.js integration

## Project Structure

```
/workspace
├── app/                    # Next.js App Router pages
│   ├── comb/              # Combination pages (/comb/[slug])
│   ├── shule/             # School pages (/shule/[slug]/uchaguzi/[year])
│   ├── uchaguzi/          # National selections hub
│   ├── mkoa/              # Regional pages
│   └── halmashauri/       # Council pages
├── backend/               # FastAPI backend
│   ├── api/               # Route handlers
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   ├── core/              # Config & database
│   └── main.py            # Application entry point
├── components/            # React components
├── lib/                   # Utilities & API client
├── types/                 # TypeScript type definitions
└── *.py                   # SQLAlchemy models
```

## Key Features

### KATA/MKOA Handling
The raw selection status values (KATA, MKOA, KUTWA, BWENI) are **aggregated during import** into stored columns:
- `outgoing_ward_scope` ← KATA (same ward)
- `outgoing_regional_scope` ← MKOA (same region)
- `outgoing_day` ← KUTWA
- `outgoing_boarding` ← BWENI

These are accessed via `SchoolSummaryStats` in both backend and frontend.

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/selections/shule/{slug}/{year}` | School selections summary |
| `GET /api/v1/selections/uchaguzi/{year}/summary` | National summary |
| `GET /api/v1/selections/mchanganyiko/{slug}` | Combination details |
| `GET /api/v1/selections/mchanganyiko/{slug}/stats` | Combination national stats |
| `GET /api/v1/selections/mchanganyiko/{slug}/mkoa/{region_id}/stats` | Regional stats |
| `GET /api/v1/selections/mchanganyiko/{slug}/halmashauri/{council_id}/stats` | Council stats |
| `GET /api/v1/selections/mtiririko/{year}` | School flow data |

## Getting Started

### Backend Setup

```bash
cd /workspace
pip install fastapi uvicorn sqlalchemy pydantic-settings psycopg2-binary

# Set environment variables
export DATABASE_URL="postgresql://user:pass@localhost/shuleyetu"

# Run the API server
python -m backend.main
```

Server runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd /workspace
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` in `.env.local`

## Page Coverage

Based on blueprint v6:

| Page Type | URL Pattern | Count |
|-----------|-------------|-------|
| School selections | `/shule/{slug}/uchaguzi/{year}` | ~100k+ |
| National hub | `/uchaguzi/{year}` | ~5 |
| Combination national | `/comb/{slug}` | ~20 |
| Combination × region | `/comb/{slug}/mkoa/{region}` | ~620 |
| Combination × council | `/comb/{slug}/halmashauri/{council}` | ~3.7k |
| Region selections | `/mkoa/{slug}/uchaguzi/{year}` | ~155 |
| Council selections | `/halmashauri/{slug}/uchaguzi/{year}` | ~925 |
| Flow map | `/mtiririko/{exam}/{year}` | ~45 |

## Dark Mode Support

All components use Tailwind's `dark:` variants:
- `bg-gray-50 dark:bg-gray-900`
- `text-gray-900 dark:text-white`
- `border-gray-200 dark:border-gray-700`

Enable dark mode by adding `dark` class to `<html>` element or using system preference.

## License

MIT License
