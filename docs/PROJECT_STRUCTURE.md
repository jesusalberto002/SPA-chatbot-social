# Project layout

Monorepo: **SPA app** (existing product) + **portfolio / recruiter** surface + **RAG API** (Node, same backend).

```
SPA-chatbot-social/
├── docs/                          # Architecture notes (this file)
├── knowledge/                     # Source text for RAG (CV, bio, project blurbs)
│   ├── cv/                        # Markdown chunks you own; safe to commit
│   └── projects/                  # Per-project summaries for retrieval
├── scripts/
│   └── rag/                       # One-off: embed + upsert into vector store
├── backend/                       # Express API (existing + RAG under src/rag)
│   └── src/
│       ├── rag/
│       │   ├── routes/            # HTTP: /api/portfolio-rag/*
│       │   ├── services/          # Embeddings, retrieval, orchestration
│       │   └── prompts/           # System / user prompt templates
│       └── routes/                # Existing API routers
└── webFrontend/                   # Vite + React
    └── src/
        ├── features/
        │   ├── portfolio/         # Earlier scaffold; same API as presentation-card
        │   └── presentation-card/ # Public CV / projects / recruiter RAG UI
        │       ├── api/
        │       ├── assets/images/
        │       ├── components/
        │       │   ├── layout/    # Header, footer, shell
        │       │   ├── sections/  # Hero, Projects, Chat
        │       │   └── ui/
        │       ├── constants/
        │       ├── data/          # projects.js — list of portfolio projects (SPA is one entry)
        │       ├── hooks/
        │       ├── pages/
        │       └── styles/
        └── ...                    # Existing app pages & components
```

## Deployments (target)

| Piece              | Typical host | Notes                                      |
|--------------------|--------------|--------------------------------------------|
| Portfolio + app UI | Vercel       | `VITE_*` for public API base URLs only     |
| Main + RAG API     | Render       | Secrets: DB, OpenAI, JWT, Stripe, etc.     |
| Vector / DB        | Supabase     | `pgvector` + Prisma or raw SQL             |

## API paths

- Existing API: `/api/...`
- Portfolio RAG (scaffold): `/api/portfolio-rag/health` — extend with `POST /chat` when ready.
- Frontend route: `/` (and `/presentation` redirects to `/`) → `PresentationPage`. Projects include a card linking to `/app` (SPA demo) alongside other projects in `data/projects.js`.
