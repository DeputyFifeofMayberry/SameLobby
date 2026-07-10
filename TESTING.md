# Testing guide

SameLobby test program is governed by `SAMELOBBY_TEST_IMPLEMENTATION_BUILD_PLAN.md` (v4). This document summarizes how to run suites locally and how traceability works.

## Branch status

Active branch: `main`. Phase 1 infrastructure complete as of commit documenting `docs/testing/baseline/502e45f/phase-1-results.md`.

## Baseline SHA

Inventory `baselineSha`: `ed10f19e528b6ec406553795cf2cd891427fe668` (see `tests/test-inventory.json`). Full baseline reproduction: `docs/testing/baseline/0522b2d/results.md`.

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
| `npm run test:traceability:phase -- --phase=1` | Validate Phase 1 infrastructure closure |
| `npm run test:traceability:phase -- --phase=N` | Validate phase N SL-T closure (implementation) |
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
- **Product decisions:** `docs/testing/product-decisions.json` (Q01–Q23 approved).
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
- `migration-drift` — `npm run test:migration-drift` + `npm run test:types:check` after local reset.
- `coverage` — `npm run test:coverage` archive upload (no thresholds in Phase 1).
- `db-security-integration` — API P0 + integration P0 against local Supabase.
- `quality` — lint, typecheck, unit tests, build.
- `e2e` — Playwright chromium + a11y against local Supabase + production build.

## Phase gates

Implementation proceeds by phase per build plan §M. Phase 0/0B covers baseline + D15 fix. **Phase 1** delivers harness, guards, migration-drift/types checks, coverage archive, and CI jobs. Phase 2+ implements SL-T database and domain suites.

Close Phase 1 with:

```bash
npx tsx scripts/verify-test-traceability.ts --mode=plan --write-generated
npm run test:traceability:phase -- --phase=1
```

## Artifact policy

- Mask secrets in CI logs.
- Do not commit Supabase keys from baseline runs.
- Scan uploaded artifacts for PII/secrets per build plan §L.

## Related documents

- `SAMELOBBY_TEST_IMPLEMENTATION_BUILD_PLAN.md` — execution plan (v4)
- `docs/testing/samelobby_Test_Implementation_Plan.md` — detailed gap analysis
- `AGENTS.md` — agent constraints for test work
