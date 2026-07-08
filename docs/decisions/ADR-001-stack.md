# ADR-001: Application stack (Slice 1)

**Status:** Accepted  
**Date:** 2026-07-08

## Context

SameLobby requires a solo-founder-friendly stack that supports secure auth, PostgreSQL with RLS, realtime messaging (later), and fast preview deployments.

## Decision

| Layer           | Choice                                                      |
| --------------- | ----------------------------------------------------------- |
| Framework       | Next.js 16.2.x (App Router, TypeScript strict)              |
| Styling         | Tailwind CSS 4 + Slice 0 design tokens                      |
| Database / Auth | Supabase (PostgreSQL, Auth email+password per ADR-002, RLS) |
| Hosting         | Vercel (preview + production)                               |
| Email           | Resend (transactional — wired in later slices)              |
| Analytics       | PostHog allowlist registry (provider wired later)           |
| Errors          | Sentry stub with scrub rules until DSN configured           |
| Tests           | Vitest (unit), pgTAP via `supabase test db` (RLS)           |

## Consequences

- Modular monolith in `src/domains/*` — no microservices at MVP.
- Service role key only on server via `src/lib/supabase/admin.ts`.
- Deny-by-default RLS on all user-linked tables from Slice 1.

## Vercel deployment notes

1. Create Vercel project linked to `DeputyFifeofMayberry/SameLobby`.
2. Set environment variables per environment (see `.env.example`).
3. Enable preview deployments on pull requests.
4. Production Supabase project separate from staging/local.
5. Run migrations against staging before promoting production.

## Version verification

- Next.js pinned to `16.2.10` in `package.json` (verify npm before upgrades).
- Re-check Supabase CLI and provider limits quarterly.
