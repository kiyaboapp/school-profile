# Shuleni - Tanzania School Selections Platform

Professional Next.js 14 + FastAPI platform for comprehensive Tanzania school selections data.

## 🚀 Architecture

### Frontend (Next.js 14+)
- **Location**: `/workspace/app/shuleni/**`
- **Framework**: Next.js 14 App Router with Server Components
- **Styling**: Tailwind CSS with mobile-first responsive design
- **Features**: Full dark mode support, SEO-optimized, ISR caching

### Backend (FastAPI)
- **Location**: `/workspace/backend/**`
- **Schemas**: Pydantic models mirroring SQLAlchemy database models
- **Services**: Business logic layer for data queries
- **API Routes**: RESTful endpoints under `/api/v1/shuleni/*`

## 📁 Project Structure

```
/workspace
├── app/                          # Next.js App Router
│   ├── shuleni/                  # All platform pages
│   │   ├── school/[slug]/selections/[year]/page.tsx
│   │   ├── selections/[year]/page.tsx
│   │   ├── region/[slug]/selections/[year]/page.tsx
│   │   ├── council/[slug]/selections/[year]/page.tsx
│   │   ├── comb/[slug]/page.tsx
│   │   ├── comb/[slug]/region/[regionSlug]/page.tsx
│   │   ├── comb/[slug]/council/[councilSlug]/page.tsx
│   │   └── flows/[year]/page.tsx
│   ├── layout.tsx
│   └── page.tsx                  # Homepage
├── backend/                      # FastAPI Backend
│   ├── api/selections.py         # API routes
│   ├── schemas/__init__.py       # Pydantic schemas
│   ├── services/selections.py    # Business logic
│   └── core/                     # Config & database
├── lib/
│   ├── api.ts                    # API client
│   └── utils.ts                  # Helper functions
└── types/index.ts                # TypeScript types
```

## 🔌 API Endpoints

### Base URL: `/api/v1/shuleni`

#### Selections
- `GET /selections/{year}/summary` - National summary
- `GET /school/{slug}/selections/{year}` - School selections
- `GET /region/{slug}/selections/{year}` - Regional selections
- `GET /council/{slug}/selections/{year}` - Council selections
- `GET /top-combinations/{year}` - Top combinations
- `GET /top-incoming-schools/{year}` - Top incoming schools
- `GET /top-outgoing-schools/{year}` - Top outgoing schools
- `GET /flows/{year}?exam_type=alevel` - School flows

#### Combinations
- `GET /comb/{slug}` - Combination details
- `GET /comb/{slug}/stats?year=2024` - National stats
- `GET /comb/{slug}/region/{regionSlug}/stats` - Regional stats
- `GET /comb/{slug}/council/{councilSlug}/stats` - Council stats
- `GET /comb/{slug}/schools-offering?limit=100` - Destination schools
- `GET /comb/{slug}/feeder-schools?limit=100` - Origin schools

## 🎯 Key Features

### Geographic Scope Handling
The platform correctly handles geographic distribution:
- `outgoing_ward_scope`: Students placed OUTSIDE their ward (KATA leakage)
- `outgoing_council_scope`: Students placed OUTSIDE their council
- `outgoing_regional_scope`: Students placed OUTSIDE their region (MKOA leakage)

**Retention is calculated as**: `Total - Outgoing = Retained`

### Page Types & Scale
| Page Type | URL Pattern | Estimated Count |
|-----------|-------------|-----------------|
| School Selections | `/shuleni/school/{slug}/selections/{year}` | ~100,000+ |
| National Summary | `/shuleni/selections/{year}` | ~5 |
| Regional Selections | `/shuleni/region/{slug}/selections/{year}` | ~155 (31 regions × 5 years) |
| Council Selections | `/shuleni/council/{slug}/selections/{year}` | ~920 (184 councils × 5 years) |
| Combination Detail | `/shuleni/comb/{slug}` | ~50 |
| Comb × Region | `/shuleni/comb/{slug}/region/{region}` | ~1,550 |
| Comb × Council | `/shuleni/comb/{slug}/council/{council}` | ~9,200 |
| Flow Data | `/shuleni/flows/{year}` | ~10 |

**Total Potential Pages**: 110,000+

## 🛠️ Setup

### Frontend
```bash
cd /workspace
npm install
npm run dev
```

### Backend
```bash
cd /workspace/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🎨 Design Principles

1. **Mobile-First**: All components use responsive Tailwind classes
2. **Dark Mode**: Full support with `dark:` variants throughout
3. **SEO-Optimized**: Dynamic metadata, structured data, semantic HTML
4. **Performance**: ISR with 1-hour revalidation, server components
5. **Accessibility**: Proper heading hierarchy, ARIA labels, keyboard navigation

## 📊 Data Model Alignment

All TypeScript types and Pydantic schemas directly mirror the SQLAlchemy models:
- `SchoolSummaryStats` - Core selections data
- `SchoolCombStats` - Combination breakdowns
- `SchoolFlowStats` - School-to-school flows
- `CombStats` - Combination statistics
- `NectaComb` - Combination definitions

## 🔐 Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 📝 License

Proprietary - KiyaboApp

---

Built with ❤️ for Tanzania's education ecosystem
