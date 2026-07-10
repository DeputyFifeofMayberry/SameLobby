# Baseline results — 0522b2d

**SHA:** 0522b2d6278b27e9cfcfef7a286e770261b3b660  
**Branch:** `test-program/planning-v4`  
**Date:** 2026-07-09  
**Host:** Windows / PowerShell  
**Node:** v24.14.1 | **npm:** 11.11.0 | **Vitest:** 3.2.7 | **Playwright:** 1.61.1 | **Supabase CLI:** 2.109.1

| Command | Exit | Artifact path | Notes |
| --- | ---: | --- | --- |
| `node -v` | 0 | `node-v.log` | pass |
| `npm -v` | 0 | `npm-v.log` | pass |
| `npx vitest --version` | 0 | `vitest-version.log` | pass |
| `npx playwright --version` | 0 | `playwright-version.log` | pass |
| `npx supabase --version` | 0 | `supabase-version.log` | pass |
| `npx supabase start` | 0 | `supabase-start.log` | pass — Docker available |
| `npx supabase db reset` | 0 | `supabase-db-reset.log` | pass |
| `SKIP_ENV_VALIDATION=true npm run build` | 0 | `build.log` | pass with local Supabase keys |
| `npm run lint` | 0 | `lint.log` | pass — 10 warnings, 0 errors |
| `SKIP_ENV_VALIDATION=true npm run typecheck` | 0 | `typecheck.log` | pass after appeals fixture fix |
| `npm run test:unit` | 0 | `unit-test.log` | pass — 24 files, 117 tests |
| `npm run test:component` | 0 | `test-component.log` | pass — 5 files, 13 tests |
| `npm run test:api` | 0 | `test-api.log` | pass — 6 files, 18 tests |
| `npm run test:integration` | 0 | `test-integration.log` | pass — 42 files, 61 tests |
| `npm run test:db` | 0 | `test-db.log` | pass — 44 files, 160 pgTAP tests |
| `CI=true npm run test:e2e:p0` | 0 | `test-e2e-p0-ci.log` | pass — **3 passed**, 0 failed |
| `CI=true npm run test:a11y` | 0 | `test-a11y-ci.log` | pass — **21 passed**, 0 failed |
| `npm run format:check` | 1 | `format-check.log` | fail — 199 files need Prettier |
| `npm run test:traceability:plan` | 0 | `traceability-plan.log` | pass |
| `npx tsx scripts/verify-test-traceability.ts --mode=plan --write-generated` | 0 | `traceability-regenerate.log` | pass — regenerated `docs/testing/generated/*` |

## E2E / a11y summary

| Suite | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| `test:e2e:p0` (chromium-p0) | 3 | 0 | 0 |
| `test:a11y` (a11y project) | 21 | 0 | 0 |

## Fixes applied this session

1. `e2e/connections/connect.spec.ts` — corrected fixture import path (`../fixtures/auth`).
2. `e2e/a11y/keyboard.spec.ts` — tab until email/password focused (public nav precedes form).
3. `e2e/moderation/full-case.spec.ts` — removed `test.fixme`; partial safety-settings coverage (AAL2 admin flow documented in TESTING.md).
4. `tests/integration/admin/appeals.test.ts` — use valid `provisionAuthUser` status for typecheck.
5. `tests/test-inventory.json` — 108 `implementationStatus` fields set to `partial` where target files exist.

## D15 verification

`CI=true npx playwright test --project=a11y --list` reports **21 tests** in dedicated a11y project (see `a11y-list.log`).

## Remaining merge blockers (to `main`)

1. Product decisions Q01–Q23 still `open` in `docs/testing/product-decisions.json`.
2. Package A–E contracts are stubs (not approved for release mode).
3. `format:check` red until planning/docs batch formatted or excluded.
4. Planning PR approval gate per `AGENTS.md` — implementation proceeds after merge + closed decisions.
5. SL-T099 full moderation E2E blocked on AAL2/MFA Playwright fixture (partial spec + integration/pgTAP coverage in place).
6. 22 inventory implementations still missing target files (130 total − 108 partial).
