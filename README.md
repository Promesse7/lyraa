# Lyraa — Every line, every meaning.

Rwanda's living lyric library: a mobile-first PWA where fans read Kinyarwanda
lyrics with English/French translations, unlock **Deep Kinyarwanda** cultural
annotations, clip favorite lines into shareable lyric cards, and grow the
archive through community submissions reviewed by cultural editors.

Built from the Lyraa Live v1.0 spec (`Todo.txt`) and the 9-screen Claude
Design handoff (Organic design system: Caprasimo + Figtree, cream ground,
terracotta + sage accents).

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack) — UI + serverless API
- **Tailwind CSS v4** — Organic design tokens in `src/app/globals.css`
- **Prisma 6** — SQLite in dev, Postgres-portable schema
- **Auth.js v5** — credentials (bcrypt ×12) + env-gated Google OAuth
- **html-to-image** — client-side lyric-card PNG export (1080px, 4:5 & 9:16)
- **Vitest** — unit tests (RBAC matrix, rate limiter, submission parser)

## Getting started

```bash
pnpm install
pnpm prisma migrate dev   # creates SQLite dev.db + runs seed
pnpm dev                  # http://localhost:3000
```

If the seed didn't run automatically: `pnpm db:seed`.

### Demo accounts (password: `lyraa123!`)

| Email | Role | Can |
|---|---|---|
| `fan@lyraa.rw` | Contributor | submit lyrics, like, comment, cards |
| `editor@lyraa.rw` | Cultural editor | everything + `/review` moderation queue |
| `artist@lyraa.rw` | Verified artist (Kagabo Prince) | artist notes, verified posts |
| `ntare@lyraa.rw` | Verified artist (MC Ntare) | artist notes, verified posts |
| `admin@lyraa.rw` | Admin | everything |

## Screens (design → route)

| Screen | Route |
|---|---|
| 01 Onboarding | `/` (redirects to `/discover` when signed in) |
| 02 Home / Discover | `/discover` |
| 03 Search & browse | `/search` (verse match + request lyrics) |
| 04 Lyric reader | `/track/[slug]` (RW/EN/FR tabs, tap a line for likes/interpretations, tap underlined terms for annotations) |
| 05 Annotation sheet | bottom sheet inside the reader |
| 06 Lyrics-to-Clip studio | `/track/[slug]/card` (pick 1–4 lines, theme, export PNG, post to feed) |
| 07 Social feed | `/feed` |
| 08 Artist profile | `/artist/[slug]` |
| 09 Submit lyrics | `/submit` (+40 pts on editor approval) |
| Moderation queue | `/review` (editor/admin) |
| Profile tab | `/profile` |

## Public API v1

Read-only, CORS-enabled, rate-limited (sliding window, 100 req/min by IP or
per-key `rpm`; pass a key via `X-Api-Key` or `Authorization: Bearer`).
Seeded demo key: `lyraa_demo_key_123`.

```
GET /api/v1/tracks?q=&genre=&artist=&limit=&offset=
GET /api/v1/tracks/{id|slug}/lyrics?lang=rw|en|fr
GET /api/v1/tracks/{id|slug}/annotations
```

Responses carry `X-RateLimit-Limit/Remaining/Reset`; exceeding returns `429`.

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm start        # serve production build (service worker active → installable PWA)
pnpm test         # vitest unit tests
pnpm lint         # eslint
pnpm db:migrate   # prisma migrate dev
pnpm db:seed      # reseed sample catalogue
```

## Production deploy notes

1. **Database:** switch `prisma/schema.prisma` datasource provider to
   `postgresql`, set `DATABASE_URL`, run `pnpm prisma migrate deploy`.
   The schema uses no SQLite-specific types.
2. **Secrets:** set a real `AUTH_SECRET` (`npx auth secret`). See `.env.example`.
3. **Google OAuth (optional):** set `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET`.
4. **Rate limiting:** in-memory per-node by default; for multi-node, implement
   `RateLimitStore` (`src/lib/rate-limit.ts`) over Redis — it's the only seam.
5. **Ops (spec §7):** wire Sentry via `@sentry/nextjs` and a privacy-friendly
   analytics script in `src/app/layout.tsx` when you have DSNs; not bundled
   in v1 by design.
6. **PWA:** manifest + service worker ship enabled; the SW only registers in
   production builds.

## Roadmap (v2.0 per spec)

AI word-level dynamic audio sync (forced alignment), live karaoke/concert
mode, magic-link email auth, custom artwork card backgrounds.
