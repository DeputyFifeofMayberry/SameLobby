# Baseline results - ed10f19

**SHA:** ed10f19e528b6ec406553795cf2cd891427fe668  
**Date:** 2026-07-09  
**Host:** Windows / PowerShell  
**Node:** v24.14.1 | **npm:** 11.11.0 | **Vitest:** 3.2.7 | **Playwright:** 1.61.1 | **Supabase CLI:** 2.109.1

| Command                                             | Exit | Artifact path                                          | Notes                                                           |
| --------------------------------------------------- | ---: | ------------------------------------------------------ | --------------------------------------------------------------- |
| `node -v`                                           |    0 | `docs/testing/baseline/ed10f19/node-v.log`             | pass                                                            |
| `npm -v`                                            |    0 | `docs/testing/baseline/ed10f19/npm-v.log`              | pass                                                            |
| `npx vitest --version`                              |    0 | `docs/testing/baseline/ed10f19/vitest-version.log`     | pass                                                            |
| `npx playwright --version`                          |    0 | `docs/testing/baseline/ed10f19/playwright-version.log` | pass                                                            |
| `npx supabase --version`                            |    0 | `docs/testing/baseline/ed10f19/supabase-version.log`   | pass                                                            |
| `npm ci`                                            |    0 | `docs/testing/baseline/ed10f19/npm-ci.log`             | pass                                                            |
| `npm run format:check`                              |    1 | `docs/testing/baseline/ed10f19/format-check.log`       | fail — 165 files need Prettier (includes new planning docs)     |
| `npm run lint`                                      |    0 | `docs/testing/baseline/ed10f19/lint.log`               | pass (11 warnings, 0 errors)                                    |
| `SKIP_ENV_VALIDATION=true npm run typecheck`        |    0 | `docs/testing/baseline/ed10f19/typecheck.log`          | pass after fixing `verify-test-traceability.ts` naming conflict |
| `npm test`                                          |    0 | `docs/testing/baseline/ed10f19/unit-test.log`          | pass — 16 files, 75 tests                                       |
| `npx supabase start`                                |    1 | `docs/testing/baseline/ed10f19/supabase-start.log`     | fail — Docker Desktop not running                               |
| `npx supabase db reset`                             |    1 | `docs/testing/baseline/ed10f19/supabase-db-reset.log`  | fail — blocked by Docker                                        |
| `npm run test:db`                                   |    1 | `docs/testing/baseline/ed10f19/test-db.log`            | fail — no local Postgres                                        |
| `npm run build`                                     |    0 | `docs/testing/baseline/ed10f19/build-retry.log`        | pass with demo Supabase keys + `SKIP_ENV_VALIDATION=true`       |
| `npx playwright install chromium --with-deps`       |    0 | `docs/testing/baseline/ed10f19/playwright-install.log` | pass                                                            |
| `CI=true npm run test:e2e`                          |    1 | `docs/testing/baseline/ed10f19/test-e2e-ci.log`        | fail — initial run before successful build                      |
| `CI=true npx playwright test --project=a11y --list` |    0 | `docs/testing/baseline/ed10f19/a11y-list.log`          | pass — **19 tests** in 1 file                                   |
| `CI=true npm run test:a11y`                         |    1 | `docs/testing/baseline/ed10f19/test-a11y-ci.log`       | fail — initial run before successful build                      |

## D15 verification (Phase 0B)

**Fixed:** Moved `testIgnore: ["**/a11y/**"]` from global config to `chromium`/`mobile` projects only; added dedicated `a11y` project with `testMatch: ["**/a11y/**"]`.

`CI=true npx playwright test --project=a11y --list` now reports **19 tests** (was 0 before fix).

## Environment blockers

- Docker Desktop required for `supabase start`, `test:db`, and CI-mode E2E with live DB.
- Staging deployment evidence not recorded (no staging run in this session).

## Phase 1 blockers

1. Product decisions Q01–Q23 still `open`.
2. Package A–E contracts are stubs (not approved).
3. `format:check` red until planning docs formatted or excluded.
4. Full E2E/a11y CI runs need successful `next build` + running Supabase (or CI environment).
