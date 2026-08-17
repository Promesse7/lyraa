# Lyraa Live v1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Lyraa Live v1.0 — Rwanda's lyric library as a production-ready, mobile-first Next.js PWA implementing the 9-screen Claude Design handoff and the Todo.txt feature spec.

**Architecture:** Next.js 15 App Router monolith (UI + serverless API routes), Prisma ORM over SQLite in dev (schema Postgres-portable for deploy), Auth.js v5 credentials auth with RBAC roles, client-side lyric-card PNG export. Mobile-first shell (max-width 430px centered) faithful to the Organic design system: Caprasimo display over Figtree, cream ground `#f5ead8`, terracotta `#c67139` + sage `#7a8a5e` accents, pill controls, 44px+ hit targets.

**Tech Stack:** Next.js 15 (App Router, TS), Tailwind CSS v4 (tokens mapped from `styles.css`), Prisma 6 + SQLite, Auth.js v5 (credentials + bcryptjs cost 12), Zod, html-to-image, Vitest.

**Spec:** `Todo.txt` (feature spec) + design handoff read from claude.ai/design project `03e1a47f-208f-4c7f-8581-9d569ff49167` (`Lyraa Mobile App.dc.html`, Organic `styles.css`). Design token values are copied into Task 1 below so the plan is self-contained.

## Global Constraints

- Mobile-first: all screens designed at 390×844; app shell centers content, `max-width: 430px`, bottom tab bar (Home / Search / Feed / Profile), 44px+ hit targets.
- Fonts: headings `Caprasimo` (weight 400 only), body `Figtree` (400/600/700) via `next/font/google`.
- Colors: bg `#f5ead8`, surface `#ebddc5`, text `#201e1d`, accent `#c67139`, accent-2 `#7a8a5e`, plus 100–900 tonal ramps for neutral/accent/accent-2 (exact hex in Task 1).
- Radii: sm 8px, md 16px, lg 28px; small controls (buttons, tags, inputs) are full pills (999px).
- Password hashing bcrypt work factor 12 (spec: argon2id or bcrypt ≥ 12).
- Roles: FAN (contributor), ARTIST (verified artist), EDITOR (cultural editor/moderator), ADMIN. Guests = unauthenticated, read-only.
- Public API: `GET /api/v1/tracks`, `GET /api/v1/tracks/{id}/lyrics?lang=rw|en|fr`, `GET /api/v1/tracks/{id}/annotations`, rate-limited (in-memory sliding window, Redis-ready interface).
- Verification badges: `ARTIST_VERIFIED`, `EDITOR_APPROVED`, `COMMUNITY` on every lyric surface.
- Languages: `rw` (primary), `en`, `fr` — per-line translations, single-tap pill switcher.
- All sample content is invented (per design note): Kagabo Prince, Umwali B, Keza Aline, MC Ntare, Cyusa Trio; tracks Amashyo y'Umutima, Inzozi za Kigali, Ntabwo Nzibagirwa, Barafite Ubwoba, Inzozi Nziza, Impundu.
- PWA: manifest + installable; genre set: Gakondo, Kinyatrap, Gospel, R&B, Afrobeats, Hip-Hop, Drill, Oldies.

## Screen → Route map (design fidelity contract)

| Design screen | Route | Key elements |
|---|---|---|
| 01 Onboarding | `/` (guests) | circle motif, music-note logo disc, "Every line, every meaning.", genre pills, "Tangira — Get started" primary pill, secondary outline pill |
| 02 Home/Discover | `/discover` | "Mwaramutse 👋" greeting, avatar disc, genre chip row, sage "Lyric of the day" hero card w/ terracotta badge, Trending list rows w/ Verified/Community badges |
| 03 Search | `/search` | pill search field (terracotta focus ring), results w/ highlighted match, sage "Verse match" card, dashed "Request these lyrics" CTA |
| 04 Lyric reader | `/track/[slug]` | back header w/ title + verified check, RW/EN/FR pill tabs, verse section headers, per-line EN translation, terracotta dotted-underline annotated terms, highlighted active line w/ like + interpretation counts, "Make a lyric card" CTA + heart button |
| 05 Annotation sheet | bottom sheet in reader | dimmed lyric backdrop, drag handle, term + "Cultural term" sage tag, Literal/Poetic/Cultural context sections, sage Artist note card, "Annotated by … · upvotes", Upvote pill |
| 06 Clip studio | `/track/[slug]/card` | dark UI (`neutral-900`), Cancel/Export header, 4:5 gradient card preview w/ LYRAA mark, background swatch picker, Story/Status/TikTok/Post-to-feed share row |
| 07 Feed | `/feed` | For you/Latest pills, card posts (user header, gradient lyric card, caption, like/comment/share counts), artist-note posts w/ verified badge |
| 08 Artist profile | `/artist/[slug]` | sage header w/ circle motif, avatar ring, verified check, stats row (Verified tracks / Artist notes / Followers), pinned interpretation card, verified lyrics list, Follow pill |
| 09 Submit lyrics | `/submit` | close ✕, "+40 pts" sage badge, Song title / Artist fields, lyrics textarea w/ `[Verse] [Chorus]` hint, sage orthography-guide info card, "Submit for review" pill |

Plus (spec, no dedicated design screen — reuse system components): `/login`, `/register`, `/profile` (4th tab), `/review` (editor moderation queue), comments sheet on feed cards.

---

### Task 1: Scaffold + design system foundation
**Files:** `package.json`, `next.config.ts`, `tsconfig.json`, `src/app/globals.css`, `src/app/layout.tsx`, `src/lib/fonts.ts`, `public/manifest.webmanifest`, `src/components/ui/*` (Pill, Chip, Badge, ListRow, TabBar, Sheet, CoverArt, Icon)
- [x] `pnpm create next-app` (TS, App Router, Tailwind v4, src dir, no ESLint conflicts)
- [x] Map Organic tokens into `globals.css` `@theme` (all hex ramps below) + pill/radius/shadow utilities
- [x] Fonts via next/font (Caprasimo, Figtree); PWA manifest; mobile shell layout w/ TabBar
- [x] Icon set: inline SVG components matching design (home, search, feed/chat, profile, heart, share, check-badge, plus, back, close, upload, image, music)
- [x] Verify `pnpm build` passes; commit

Token values (from `_ds/organic…/styles.css`): neutral 100 `#f9f4ed` 200 `#eee7db` 300 `#dcd3c4` 400 `#c0b6a5` 500 `#a19786` 600 `#82796a` 700 `#645c50` 800 `#474238` 900 `#2e2b25`; accent 100 `#fff2eb` 200 `#ffe1d0` 300 `#ffc6a5` 400 `#f6a06b` 500 `#d67f48` 600 `#b2622d` 700 `#8c491a` 800 `#643312` 900 `#402310`; accent-2 100 `#f0fae1` 200 `#e1eecc` 300 `#ccdbb2` 400 `#aebf92` 500 `#8fa073` 600 `#728157` 700 `#56633f` 800 `#3d472b` 900 `#272e1b`; shadows sm `0 1px 2px rgba(46,43,37,.14)` md `0 3px 10px rgba(46,43,37,.16)` lg `0 12px 32px rgba(46,43,37,.22)`.

### Task 2: Data layer — Prisma schema + seed
**Files:** `prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/db.ts`
- [x] Models: User(role, points), Artist(verified, follower relation), Track(genre, verification, coverGradient, streaming links), LyricSection(label, order), LyricLine(order, textRw/textEn/textFr), Annotation(phrase, literal, poetic, culturalContext, kind, upvotes, artistNote, status), LineLike, LineComment, LyricCard(theme, aspect, lines, caption), CardLike, CardComment, Submission(status PENDING/APPROVED/REJECTED), LyricRequest, Follow, ApiKey
- [x] Enums portable to Postgres (SQLite dev: strings w/ zod validation — SQLite has no enums; use Prisma enums only if provider supports; keep String + const unions in `src/lib/constants.ts`)
- [x] Seed full design sample data incl. Amashyo y'Umutima verse 1 (4 RW lines + EN/FR translations), 3 annotations (urugori, mashyo, mugani) w/ artist note, feed posts (ineza.k 482 likes, MC Ntare artist note 1.2k), demo users incl. editor + artist accounts
- [x] `pnpm prisma migrate dev` + seed runs clean; commit

### Task 3: Auth + RBAC
**Files:** `src/auth.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/lib/rbac.ts`, `src/app/api/auth/[...nextauth]/route.ts`, tests `src/lib/__tests__/rbac.test.ts`
- [x] Auth.js v5 credentials provider (bcryptjs 12), JWT session strategy w/ role + id claims; register server action w/ zod validation
- [x] `can(role, permission)` matrix per spec (`lyrics:submit`, `lyrics:verify`, `annotations:approve`, `cards:create`, `moderation:review`, …) + ownership guard helper
- [x] Vitest: permission matrix + ownership guard tests pass; commit

### Task 4: Onboarding + Discover + Search screens
**Files:** `src/app/page.tsx`, `src/app/discover/page.tsx`, `src/app/search/page.tsx`, `src/lib/queries.ts`, search server action
- [x] Screen 01 exact: circle motifs, logo disc, headline, genre pills, CTAs (authed users at `/` → redirect `/discover`)
- [x] Screen 02: greeting w/ session user initials avatar, genre filter chips (server-filtered), lyric-of-the-day hero (deterministic daily pick), trending rows w/ badges
- [x] Screen 03: live search (title/artist/genre + verse match across LyricLine text w/ highlight), request-lyrics CTA persisting LyricRequest
- [x] Commit

### Task 5: Lyric reader + annotation sheet
**Files:** `src/app/track/[slug]/page.tsx`, `src/components/reader/*` (LanguageTabs, LyricLine, AnnotationSheet, LineEngagement)
- [x] Screen 04 exact: header, RW/EN/FR tabs (client state; EN/FR swap main text, RW shows inline EN gloss), section headers, annotated phrase spans (dotted terracotta underline), active line highlight w/ like count + interpretation count, like toggle (optimistic, authed), Make-a-lyric-card CTA
- [x] Screen 05 exact: bottom sheet w/ backdrop dim, term header + kind tag, Literal/Poetic/Cultural sections, artist note card, attribution + upvote (persisted)
- [x] Line comments (interpretations) sheet: list + post (FAN+)
- [x] Commit

### Task 6: Lyrics-to-Clip studio + export
**Files:** `src/app/track/[slug]/card/page.tsx`, `src/components/studio/*`, `src/lib/card-themes.ts`
- [x] Screen 06 exact: dark chrome, line selection (1–4 consecutive lines), 4:5 preview card (gradient themes: terracotta radial, sage radial, ink radial, cream solid), LYRAA mark + attribution footer `track — artist · lyraa.rw`
- [x] Export: html-to-image → PNG download (1080×1350 4:5 and 1080×1920 9:16 toggle)
- [x] Post to feed: persists LyricCard + navigates to feed; Story/Status/TikTok buttons use Web Share API w/ PNG file fallback to download
- [x] Commit

### Task 7: Social feed + artist profile
**Files:** `src/app/feed/page.tsx`, `src/components/feed/*`, `src/app/artist/[slug]/page.tsx`
- [x] Screen 07 exact: For you/Latest toggle, card posts w/ user header, rendered gradient card, caption, like (optimistic) + comment sheet + share
- [x] Screen 08 exact: sage hero, stats, pinned interpretation, verified lyrics list, follow toggle (authed)
- [x] Commit

### Task 8: Contributor submit + moderation + profile tab
**Files:** `src/app/submit/page.tsx`, `src/app/review/page.tsx`, `src/app/profile/page.tsx`
- [x] Screen 09 exact: +40 pts badge, fields, orthography info card, submit → Submission PENDING, +points on approval
- [x] `/review` (EDITOR/ADMIN only): queue list, approve (creates Track + lyrics from submission, awards points) / reject w/ note
- [x] `/profile`: user card, points, my submissions w/ status, my cards, sign out; guests see sign-in prompt
- [x] Commit

### Task 9: Public API v1 + rate limiting
**Files:** `src/app/api/v1/tracks/route.ts`, `src/app/api/v1/tracks/[id]/lyrics/route.ts`, `src/app/api/v1/tracks/[id]/annotations/route.ts`, `src/lib/rate-limit.ts`, tests
- [x] Endpoints per spec w/ `lang` param, search/filter on /tracks; JSON errors; CORS for GET
- [x] Sliding-window limiter (100 req/min default) keyed by API key or IP; `X-RateLimit-*` headers; Vitest limiter tests
- [x] Commit

### Task 10: Production polish + verification
**Files:** `README.md`, `.env.example`, misc
- [x] `pnpm build` clean, `pnpm test` green, lint clean
- [x] README: setup, env vars, Postgres deploy switch, seed accounts, API docs
- [x] Launch app, walk all 9 screens against design, fix deviations; commit

## Self-Review notes
- Spec coverage: roles/auth (T3), track/lyric engine + multilang + badges (T2/T5), Deep Kinyarwanda (T5), clip studio + feed (T6/T7), crowdsourcing + moderation (T8), public API + rate limiting (T9), ops (README T10; Sentry/analytics documented as env-gated hooks, not integrated — out of v1 build scope, noted in README).
- OAuth social logins: env-gated Google provider scaffolding in T3; magic links documented as v1.1 (needs mail infra) — spec lists both mechanisms; credentials path fully working.
- No placeholders: each task lists exact routes/files; token values inline; sample data enumerated.
