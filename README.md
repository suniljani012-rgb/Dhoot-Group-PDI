# Autoprime PDI Management Platform
## Dhoot Group — Autoprime Tata

A production-grade Pre-Delivery Inspection (PDI) management platform for Autoprime Tata dealerships.

---

## Repository Structure

```
autoprime-pdi/
├── apps/
│   ├── web/          — React web application (Cloudflare Pages)
│   ├── mobile/       — React Native Expo mobile app
│   └── pwa/          — Progressive Web App
├── packages/
│   ├── ui/           — Shared UI components (design system)
│   ├── design-system/— Design tokens and theme
│   ├── types/        — Shared TypeScript types
│   ├── validation/   — Shared Zod validation schemas
│   ├── api-client/   — API client and hooks
│   ├── auth/         — Auth utilities
│   ├── domain/       — Domain logic and state machines
│   ├── config/       — Shared configuration
│   ├── utilities/    — General utilities
│   ├── telemetry/    — Observability utilities
│   ├── offline/      — Offline sync utilities
│   └── testing/      — Shared test utilities
├── services/
│   └── api-worker/   — Cloudflare Worker API
├── supabase/
│   ├── migrations/   — SQL migration files
│   ├── seed/         — Demo seed data
│   ├── functions/    — Supabase Edge Functions
│   └── tests/        — RLS and constraint tests
├── storage/          — R2 object storage policies
├── docs/             — Project documentation
├── scripts/          — Developer scripts
└── .github/workflows/— CI/CD pipelines
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Web | React 18 + TypeScript + Vite |
| Mobile | React Native + Expo + Expo Router |
| API | Cloudflare Workers + Hono + TypeScript |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Cloudflare R2 |
| Hosting | Cloudflare Pages |
| CI/CD | GitHub Actions |

## Documentation

All architecture and specification documents are in `/docs/`.

**Start here:**
- [Project Constitution](docs/PROJECT_CONSTITUTION.md) — Governing rules
- [Product Requirements](docs/PRODUCT_REQUIREMENTS.md) — What we build
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md) — How we build it
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) — Build sequence
- [Security Requirements](docs/SECURITY_REQUIREMENTS.md) — Security model
- [Access Control Matrix](docs/ACCESS_CONTROL_MATRIX.md) — Role permissions
- [Decisions](docs/DECISIONS.md) — Architecture decisions (ADRs)
- [Assumptions](docs/ASSUMPTIONS.md) — Recorded assumptions

## Getting Started (Development)

> Prerequisites: Node.js 20+, pnpm 9+, Supabase CLI, Cloudflare CLI (wrangler)

```bash
# Install dependencies
pnpm install

# Start Supabase locally
cd supabase && supabase start

# Start API Worker
pnpm --filter api-worker dev

# Start Web App
pnpm --filter web dev

# Start Mobile App
pnpm --filter mobile start
```

## Environment Configuration

Copy `.env.example` to `.env` in the relevant app directory.
**Never commit `.env` files with real values.**

## Contributing

1. Read the [Project Constitution](docs/PROJECT_CONSTITUTION.md)
2. Check [Implementation Status](docs/IMPLEMENTATION_STATUS.md) for current phase
3. Create a feature branch: `feature/phase-N-description`
4. Run CI locally before pushing: `pnpm typecheck && pnpm lint && pnpm test`
5. PRs require all CI checks to pass before merge

## License

Proprietary — Dhoot Group / Autoprime Tata. All rights reserved.
