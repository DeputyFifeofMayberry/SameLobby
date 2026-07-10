# Phase 8 close — 502e45f

**SHA:** 502e45f + Phases 1–8 test program commits  
**Branch:** `main`  
**Date:** 2026-07-10

## Phase 8 deliverables

| Area | Status |
| --- | --- |
| Package 8.1 component tests (SL-T038, SL-T073) | done |
| Package 8.1 integration expiry (SL-T048) | done |
| Package 8.1 a11y specs (SL-T062, SL-T085) | done |
| Package 8.2 load script marker (SL-T120:load) | done |
| `accept_connection_request` expiry persist migration | done |
| Canonical anchors filled for 6 Phase 8 SL-T IDs | done |
| `scripts/close-phase8.ts` | done |
| `test:traceability:phase -- --phase=8` gate | done |
| `test:traceability:release` gate | done |

## Verification commands

| Command | Exit | Notes |
| --- | ---: | --- |
| `npm run test:traceability:phase -- --phase=8` | 0 | 6 implementations complete |
| `npm run test:traceability:release` | 0 | All 130 implementations complete |
| `npx vitest run --project component` (SL-T038, SL-T073) | 0 | 2 files, 2 tests |
| `npx vitest run --project integration tests/integration/connections/expiry.test.ts` | 0 | SL-T048 after expiry-persist migration |
| `npm run test:a11y` (SL-T062, SL-T085) | not run in this close | run locally with dev server + local Supabase |
| `npm run test:load:realtime` (SL-T120) | not run in this close | requires k6 + staging credentials |

## Product fix (SL-T048)

`accept_connection_request` previously raised an exception after marking a request `expired`, which rolled back the status update in the same transaction. Migration `20260720020000_connection_request_expiry_persist.sql` returns `null` instead so the expiry row persists; `acceptConnectionRequest` now maps null + `expired` status to the user-facing message.

## Program status

Phase 8 is the **final inventory phase** in build plan v4. Release traceability (`test:traceability:release`) passes with all 130 implementations marked complete.

Remaining follow-up (out of Phase 8 inventory scope):

1. Phase 7 E2E gaps — conversation thread SSR error boundary, group free-tier limit flakes.
2. Full `test:e2e` / `test:a11y` CI slices before production release.
3. k6 load run against staging for SL-T120 threshold validation (plan §N).
