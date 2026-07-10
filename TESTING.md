# Testing guide

SameLobby test program is governed by `SAMELOBBY_TEST_IMPLEMENTATION_BUILD_PLAN.md` (v4). This document summarizes how to run suites locally and how traceability works.

## Branch status

Active planning branch: `test-program/planning-v4`. Latest full baseline reproduction: `docs/testing/baseline/0522b2d/results.md`.

## Baseline SHA

Inventory `baselineSha`: `ed10f19e528b6ec406553795cf2cd891427fe668` (see `tests/test-inventory.json`). Verification at commit `0522b2d` recorded under `docs/testing/baseline/0522b2d/`.

## Quick commands

| Command                                        | Purpose                                      |
| ---------------------------------------------- | -------------------------------------------- |
| `npm run test:unit`                            | Vitest unit project only                     |
| `npm run test:api`                             | Vitest API project (local Supabase wrapper)  |
| `npm run test:integration`                     | Vitest integration project (local Supabase)  |
| `npm run test:integration:p0`                  | Integration P0 slice (`@p0` title filter)    |
| `npm run test:e2e:p0`                          | Playwright chromium P0 slice (`@p0` grep)    |
| `npm run test:db`                              | pgTAP database tests via Supabase            |
| `npm run test:e2e`                             | Playwright chromium journeys                 |
| `npm run test:a11y`                            | Playwright a11y project only                 |
| `npm run test:traceability:plan`               | Validate planning inventory + generated docs |
| `npm run test:traceability:phase -- --phase=N` | Validate phase N closure (implementation)    |
| `npm run test:traceability:release`            | Validate release readiness                   |

## Local prerequisites

1. Node.js and npm (record exact versions in baseline artifacts).
2. Docker for local Supabase (`npx supabase start`).
3. Playwright browsers (`npx playwright install chromium --with-deps`).

## Baseline reproduction (Phase 0)

Run the exact commands in build plan §C. Record exit codes and log paths under `docs/testing/baseline/<short-sha>/results.md`.

Key environment variables for build/E2E:

- `SKIP_ENV_VALIDATION=true`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from `npx supabase status -o json`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `CI=true` for CI-mode Playwright (starts `npm run start` via config)

## Inventory and traceability

- **Authoritative inventory:** `tests/test-inventory.json` (schemaVersion 2, 120 SL-T requirements).
- **Canonical anchors:** `docs/testing/canonical-anchors.md` (setup/steps/expected per ID).
- **Product decisions:** `docs/testing/product-decisions.json` (Q01–Q23; open until approved).
- **Generated snapshots:** `docs/testing/generated/` — regenerate via `npx tsx scripts/generate-test-artifacts.ts`; CI diffs these files.

### Title markers

| Layer    | Marker example                           |
| -------- | ---------------------------------------- |
| TS/TSX   | `[SL-T051][notification-db-failure] @p0` |
| SQL      | `-- SL-T049:db @p0`                      |
| Ops/live | implementation key + workflow evidence   |

## Playwright projects

`playwright.config.ts` defines:

- `chromium` / `mobile` — journey specs; **ignore** `**/a11y/**`
- `a11y` — accessibility specs only (`testMatch: **/a11y/**`)

Do not use global `testIgnore` for a11y (defect D15).

## Known E2E gaps (planning)

| ID | Spec | Blocker |
| --- | --- | --- |
| SL-T099 | `e2e/moderation/full-case.spec.ts` | Full report → AAL2 admin claim/evidence/action → appeal flow requires MFA (AAL2) session fixture not yet available in Playwright. Current spec covers safety settings only; admin workflow covered by integration (`SL-T090`–`SL-T093`) and pgTAP (`SL-T091`). |

## CI jobs

- `database` — `supabase test db` (pgTAP RLS/security suite).
- `db-security-integration` — skeleton job (disabled via `if: false`) for Phase 3+ Vitest integration against local Supabase; enable when wiring `npm run test:integration:p0` into CI.
- `quality` — lint, typecheck, unit tests, build.
- `e2e` — Playwright chromium + a11y against local Supabase + production build.

## Phase gates

Implementation proceeds by phase per build plan §M. Phase 0/0B covers baseline + D15 fix. Phase 1+ adds harness, suites, and CI gates. Do not start Phase 1 until planning PR is merged and product decisions/contracts are approved.

## Artifact policy

- Mask secrets in CI logs.
- Do not commit Supabase keys from baseline runs.
- Scan uploaded artifacts for PII/secrets per build plan §L.

## Related documents

- `SAMELOBBY_TEST_IMPLEMENTATION_BUILD_PLAN.md` — execution plan (v4)
- `docs/testing/samelobby_Test_Implementation_Plan.md` — detailed gap analysis
- `AGENTS.md` — agent constraints for test work
