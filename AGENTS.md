# LLM Recommender — Project Summary

## Stack
- **Next.js 16.2**, Turbopack, Tailwind v4
- **Prisma v7** with PostgreSQL (Prisma Postgres / Vercel Storage)
- **Prisma adapter**: `@prisma/adapter-pg` + `pg` package (Neon adapter incompatible with `db.prisma.io`)
- **Deployment**: Vercel (auto-deploy from `master`), Hobby plan (10s limit)
- **HuggingFace API** for model data, **lucide-react** icons
- **Testing**: Vitest, `npx vitest run`
- **Build**: `npx next build`
- **Interface**: Russian; no auth

## Database
- Schema: `prisma/schema.prisma`
- Config: `prisma.config.ts` (uses `DATABASE_URL`)
- GPU data seeded at build time via `scripts/seed-gpus.ts` (13 Apple + 544 CSV GPUs)
- Seed runs from `scripts/postinstall.js` as `postinstall` hook
- `DATABASE_URL`, `POSTGRES_URL`, `PRISMA_DATABASE_URL` set on Vercel

## Architecture
- `src/lib/prisma.ts` — PrismaClient singleton with `@prisma/adapter-pg` + `pg.Pool`
- `src/lib/gpuDatabase.ts` — `getGpus()` reads from DB
- `src/lib/huggingface.ts` — `inferTags()` assigns tags (`instruct`, `code`, `vision`, `reasoning`, `math`, `base`)
- State: `sessionStorage` (search), `localStorage` (favorites)
- Tags filter in `ResultsList.tsx`, VRAM bar in `ModelCard.tsx`

## Key Config
- `next.config.ts`: `serverExternalPackages: ["pg", "@prisma/adapter-pg"]`
- `env` vars required: `DATABASE_URL` (local: copy POSTGRES_URL from Vercel Storage)

## Current Status
- **Live**: https://llm-recommender.vercel.app — site working, API returning 200
- **Tags**: instruct, code, vision, reasoning, math, base — filterable, displayed on cards
- **VRAM bar**: colored progress (green/yellow/red) based on userVram fill ratio
- **Best model**: green ring + "Лучшая" badge
- **Favorites**: Bookmark icon (lucide-react), saved in localStorage
- **Theme toggle**: Sun/Moon icons (lucide-react)
- **All icons**: lucide-react, no emoji
- **GPU seeding**: works at build time on Vercel
