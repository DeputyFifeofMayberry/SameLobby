# SameLobby Test Implementation Build Plan (v4)

> **Approval status: NOT APPROVED for implementation.**  
> **Technical baseline:** `main` @ `ed10f19e528b6ec406553795cf2cd891427fe668`  
> **Last reconciled SHA / date:** `ed10f19` / 2026-07-10  
> **This document is standalone.** It does not depend on v1/v2/v3 plan text. Superseded plans are historical only.  
> **Owner:** Test implementation lead  
> **Planning edit only — no repository code/tests/CI changed by this revision.**

---

## A. Approval and execution sequence (non-circular)

| Step | Action                                                                                                                                                                                                                                                                                   | Code allowed?       |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1    | Open **planning PR** containing: this v4 plan as `SAMELOBBY_TEST_IMPLEMENTATION_BUILD_PLAN.md`, `docs/testing/samelobby_Test_Implementation_Plan.md`, complete `tests/test-inventory.json`, stub `docs/testing/product-decisions.json`, generated matrix under `docs/testing/generated/` | Docs/inventory only |
| 2    | On that PR, run **exact baseline commands** (§C) and paste results into §C                                                                                                                                                                                                               | No feature work     |
| 3    | If baseline red: open **Phase 0B pre-program baseline-remediation PRs** (explicitly authorized; not “program implementation”)                                                                                                                                                            | Only baseline fixes |
| 4    | Update planning PR to remediated SHA; re-run full baseline                                                                                                                                                                                                                               | Docs only           |
| 5    | **Approve and merge** planning PR                                                                                                                                                                                                                                                        | —                   |
| 6    | Close product decisions; complete Production Contract Freeze artifacts (§G)                                                                                                                                                                                                              | Docs/contracts only |
| 7    | Start **Phase 1** implementation                                                                                                                                                                                                                                                         | Yes                 |

Phase 0B = pre-program baseline remediation. It is **not** ordinary SL-T implementation.

---

## B. Preapproval reconciliation (ed10f19)

### Commits since obsolete `f866531`

| SHA                   | Impact                                              |
| --------------------- | --------------------------------------------------- |
| `b88033c`             | Runbooks                                            |
| `8961fb4`             | CI chromium-only; a11y ignored in main e2e          |
| `9a9410d`             | `20260718050000_service_role_e2e_grants.sql`        |
| `254e1ab`             | Cookie session injection                            |
| `a69fc98`             | CI exports Supabase keys **unmasked**               |
| `f32656b` / `38091bf` | CLI pin 2.20.12 attempted then reverted to `latest` |
| `3d4a48d`             | Magic-link-first `signIn` (**D14**)                 |
| `ed10f19`             | `site_url` localhost                                |

### Known baseline defect (must be Phase 0B)

**D15 — CI a11y suite filtered by global `testIgnore`:** When `CI` is set, top-level `testIgnore: ["**/a11y/**"]` applies to **all** projects, including `npm run test:a11y`. Fix: move a11y ignore into chromium/mobile projects only; require `playwright test --project=a11y --list` count > 0 before running a11y.

---

## C. Exact baseline commands (reproducible)

Record exit code + stdout path for each. Use PowerShell or bash as noted.

```bash
# Versions
node -v                                    # pin exact patch in CI after record
npm -v
npx vitest --version
npx playwright --version
npx supabase --version

npm ci

# Format (full check for baseline reproducibility)
npm run format:check

npm run lint

# Typecheck (current CI behavior)
SKIP_ENV_VALIDATION=true npm run typecheck

# Unit
npm test

# Supabase
npx supabase start
npx supabase db reset
npm run test:db

# Keys (mask in CI; for local baseline, do not commit)
API_URL=$(npx supabase status -o json | jq -r '.API_URL')
ANON_KEY=$(npx supabase status -o json | jq -r '.ANON_KEY')
SERVICE_ROLE_KEY=$(npx supabase status -o json | jq -r '.SERVICE_ROLE_KEY')

# Build
SKIP_ENV_VALIDATION=true \
  NEXT_PUBLIC_SUPABASE_URL="$API_URL" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" \
  SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" \
  NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  npm run build

# Playwright browsers
npx playwright install chromium --with-deps

# E2E in CI mode (server starts via config when CI=true)
CI=true \
  SKIP_ENV_VALIDATION=true \
  PLAYWRIGHT_BASE_URL=http://localhost:3000 \
  NEXT_PUBLIC_SUPABASE_URL="$API_URL" \
  NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" \
  SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" \
  NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  npm run test:e2e

# A11y — AFTER Phase 0B fix; until then expect failure / zero tests (document)
CI=true PLAYWRIGHT_BASE_URL=http://localhost:3000 \
  npx playwright test --project=a11y --list
CI=true PLAYWRIGHT_BASE_URL=http://localhost:3000 \
  npm run test:a11y

# Staging evidence (if staging exists)
# gh api repos/.../deployments  OR  vercel ls + documented deployment URL
# Record deployment ID, URL, status; smoke evidence path if any
```

| Command               | Exit | Artifact path                     | Notes |
| --------------------- | ---- | --------------------------------- | ----- |
| (fill on planning PR) | TBD  | `docs/testing/baseline/<sha>/...` |       |

---

## D. Inventory schema (implementation-level)

File: `tests/test-inventory.json`

```json
{
  "schemaVersion": 2,
  "baselineSha": "ed10f19e528b6ec406553795cf2cd891427fe668",
  "requirements": [
    {
      "id": "SL-T049",
      "priority": "P0",
      "canonicalHeadingId": "sl-t049",
      "implementations": [
        {
          "key": "SL-T049:db",
          "layer": "database",
          "file": "supabase/tests/rls/messages.test.sql",
          "phase": 2,
          "package": "2.5",
          "baselineStatus": "partial",
          "implementationStatus": "missing",
          "disposition": "required",
          "deferredRecord": null,
          "decisions": [],
          "defects": [],
          "coShipsWith": null,
          "contractRef": null,
          "setupRef": "docs/testing/canonical-anchors.md#sl-t049-setup",
          "stepsRef": "docs/testing/canonical-anchors.md#sl-t049-steps",
          "expectedRef": "docs/testing/canonical-anchors.md#sl-t049-expected",
          "titleMarker": "-- SL-T049:db @p0",
          "owner": "test-implementation-lead",
          "devCommand": "supabase test db supabase/tests/rls/messages.test.sql",
          "suiteCommand": "npm run test:db",
          "acceptanceCommand": "npm run test:db"
        },
        {
          "key": "SL-T049:realtime",
          "layer": "integration",
          "file": "tests/integration/messaging/realtime-authz.test.ts",
          "phase": 4,
          "package": "4.2",
          "baselineStatus": "missing",
          "implementationStatus": "missing",
          "disposition": "required",
          "deferredRecord": null,
          "decisions": [],
          "defects": [],
          "coShipsWith": null,
          "contractRef": null,
          "setupRef": "docs/testing/canonical-anchors.md#sl-t049-setup",
          "stepsRef": "docs/testing/canonical-anchors.md#sl-t049-steps",
          "expectedRef": "docs/testing/canonical-anchors.md#sl-t049-expected",
          "titleMarker": "[SL-T049][realtime] @p0",
          "owner": "test-implementation-lead",
          "devCommand": "npx vitest run --project integration tests/integration/messaging/realtime-authz.test.ts",
          "suiteCommand": "npm run test:integration:p0",
          "acceptanceCommand": "npm run test:integration:p0"
        }
      ]
    }
  ]
}
```

**Requirement-level** `status` / `decisions` / `defects` are **computed aggregates** — never hand-edited.

**Markers:**

| Layer    | Marker                                                 |
| -------- | ------------------------------------------------------ |
| TS/TSX   | `[SL-T051][notification-db-failure] @p0` in test title |
| SQL      | `-- SL-T049:db @p0`                                    |
| Ops/live | inventory key + workflow job evidence path             |

Skip detection: AST-parse TS/TSX for `test.skip`, `describe.skip`, `it.skip`, `skipIf`, `todo`, `fixme`, Playwright `.skip`.

**Canonical anchors:** Planning PR includes `docs/testing/canonical-anchors.md` with `<a id="sl-t049"></a>` (and setup/steps/expected) per ID. Traceability validates fragments.

**Generated snapshots** (header: `Generated from tests/test-inventory.json — do not edit`):

- `docs/testing/generated/matrix.md`
- `docs/testing/generated/phase-2.md` … `phase-8.md`
- `docs/testing/generated/counts.md`

CI: regenerate + `git diff --exit-code`.

---

## E. Complete implementation inventory (authoritative for planning PR)

> Counts must match `test:traceability:plan`. Planning PR commits JSON identical to this matrix.

### Counts (target)

| Priority      | Requirements | Implementations (approx) |
| ------------- | -----------: | -----------------------: |
| P0            |           64 |             ~75 (splits) |
| P1            |           48 |                      ~55 |
| P2            |            8 |                        8 |
| **Total IDs** |      **120** |                          |

### Multi-implementation IDs

T003, T049, T051, T055, T081, T100, T108, T113, T119 (and T055 hook split).

### Full matrix

Status key: `M` missing, `P` partial, `E` exists-expand, `R` rewrite.  
Prod: `No` \| `D##` \| `Q##` \| `D##/Q##`.

| Key                              | Pri | St  | Layer       | File                                                        | Ph    | Pkg | Prod       | Dev command                                                                                                             | Suite                                |
| -------------------------------- | --- | --- | ----------- | ----------------------------------------------------------- | ----- | --- | ---------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| SL-T001:e2e                      | P0  | M   | E2E         | `e2e/auth/protected-routes.spec.ts`                         | 3     | 3.1 | No         | `npx playwright test e2e/auth/protected-routes.spec.ts --project=chromium-p0`                                           | `npm run test:e2e:p0`                |
| SL-T002:unit                     | P0  | M   | Unit        | `src/domains/accounts/account-guard.test.ts`                | 3     | 3.1 | No         | `npx vitest run --project unit src/domains/accounts/account-guard.test.ts`                                              | `npm run test:unit`                  |
| SL-T003:integration              | P0  | P   | Integration | `tests/integration/auth/registration.test.ts`               | 3     | 3.1 | Q01        | `npx vitest run --project integration tests/integration/auth/registration.test.ts`                                      | `npm run test:integration:p0`        |
| SL-T003:db-cap                   | P0  | P   | Database    | `supabase/tests/rls/registration_cap.test.sql`              | 3     | 3.1 | No         | `supabase test db supabase/tests/rls/registration_cap.test.sql`                                                         | `npm run test:db`                    |
| SL-T004:unit                     | P1  | M   | Unit        | `src/lib/rate-limit.test.ts`                                | 6     | 6.1 | Q02        | `npx vitest run --project unit src/lib/rate-limit.test.ts`                                                              | `npm run test:unit`                  |
| SL-T004:integration              | P1  | M   | Integration | `tests/integration/auth/rate-limit.test.ts`                 | 6     | 6.1 | Q02        | `npx vitest run --project integration tests/integration/auth/rate-limit.test.ts`                                        | `npm run test:integration`           |
| SL-T005:db                       | P0  | M   | Database    | `supabase/tests/auth/provisioning.test.sql`                 | 2     | 2.2 | No         | `supabase test db supabase/tests/auth/provisioning.test.sql`                                                            | `npm run test:db`                    |
| SL-T006:integration              | P0  | M   | Integration | `tests/integration/auth/sign-in.test.ts`                    | 3     | 3.1 | Q01        | `npx vitest run --project integration tests/integration/auth/sign-in.test.ts`                                           | `npm run test:integration:p0`        |
| SL-T007:api                      | P0  | M   | API         | `tests/api/auth-callback.test.ts`                           | 3     | 3.1 | No         | `npx vitest run --project api tests/api/auth-callback.test.ts`                                                          | `npm run test:api:p0`                |
| SL-T008:integration              | P1  | M   | Integration | `tests/integration/auth/password-reset.test.ts`             | 6     | 6.1 | Q01        | `npx vitest run --project integration tests/integration/auth/password-reset.test.ts`                                    | `npm run test:integration`           |
| SL-T009:component                | P1  | M   | Component   | `src/components/auth/ResetPasswordForm.test.tsx`            | 6     | 6.9 | No         | `npx vitest run --project component src/components/auth/ResetPasswordForm.test.tsx`                                     | `npm run test:component`             |
| SL-T010:e2e                      | P0  | M   | E2E         | `e2e/auth/session-expiry.spec.ts`                           | 3     | 3.1 | D14        | `npx playwright test e2e/auth/session-expiry.spec.ts --project=chromium-p0`                                             | `npm run test:e2e:p0`                |
| SL-T011:integration              | P0  | P   | Integration | `tests/integration/accounts/attestation.test.ts`            | 3     | 3.2 | No         | `npx vitest run --project integration tests/integration/accounts/attestation.test.ts`                                   | `npm run test:integration:p0`        |
| SL-T012:db                       | P0  | M   | Database    | `supabase/tests/rls/attestation.test.sql`                   | 2     | 2.2 | No         | `supabase test db supabase/tests/rls/attestation.test.sql`                                                              | `npm run test:db`                    |
| SL-T013:integration              | P0  | P   | Integration | `tests/integration/accounts/deletion-request.test.ts`       | 3     | 3.2 | No         | `npx vitest run --project integration tests/integration/accounts/deletion-request.test.ts`                              | `npm run test:integration:p0`        |
| SL-T014:integration              | P0  | M   | Integration | `tests/integration/accounts/deletion-confirmation.test.ts`  | 4     | 4.7 | D2/Q16     | `npx vitest run --project integration tests/integration/accounts/deletion-confirmation.test.ts`                         | `npm run test:integration:p0`        |
| SL-T015:db                       | P0  | E   | Database    | `supabase/tests/rls/deletion_pipeline.test.sql`             | 2     | 2.2 | No         | `supabase test db supabase/tests/rls/deletion_pipeline.test.sql`                                                        | `npm run test:db`                    |
| SL-T016:integration              | P0  | M   | Integration | `tests/integration/profile/onboarding-order.test.ts`        | 3     | 3.3 | No         | `npx vitest run --project integration tests/integration/profile/onboarding-order.test.ts`                               | `npm run test:integration:p0`        |
| SL-T017:integration              | P0  | M   | Integration | `tests/integration/profile/identity.test.ts`                | 3     | 3.3 | D11        | `npx vitest run --project integration tests/integration/profile/identity.test.ts`                                       | `npm run test:integration:p0`        |
| SL-T018:unit                     | P1  | E   | Unit        | `src/domains/profile/schemas.test.ts`                       | 6     | 6.2 | No         | `npx vitest run --project unit src/domains/profile/schemas.test.ts`                                                     | `npm run test:unit`                  |
| SL-T019:db                       | P0  | M   | Database    | `supabase/tests/rls/user_games.test.sql`                    | 2     | 2.3 | No         | `supabase test db supabase/tests/rls/user_games.test.sql`                                                               | `npm run test:db`                    |
| SL-T020:integration              | P1  | M   | Integration | `tests/integration/profile/current-intent.test.ts`          | 6     | 6.2 | No         | `npx vitest run --project integration tests/integration/profile/current-intent.test.ts`                                 | `npm run test:integration`           |
| SL-T021:db                       | P1  | M   | Database    | `supabase/tests/rls/availability.test.sql`                  | 6     | 6.2 | Q04        | `supabase test db supabase/tests/rls/availability.test.sql`                                                             | `npm run test:db`                    |
| SL-T022:integration              | P0  | P   | Integration | `tests/integration/profile/completeness.test.ts`            | 3     | 3.3 | No         | `npx vitest run --project integration tests/integration/profile/completeness.test.ts`                                   | `npm run test:integration:p0`        |
| SL-T023:integration              | P0  | M   | Integration | `tests/integration/profile/visibility.test.ts`              | 3     | 3.3 | Q06        | `npx vitest run --project integration tests/integration/profile/visibility.test.ts`                                     | `npm run test:integration:p0`        |
| SL-T024:integration              | P1  | P   | Integration | `tests/integration/profile/games.test.ts`                   | 6     | 6.2 | No         | `npx vitest run --project integration tests/integration/profile/games.test.ts`                                          | `npm run test:integration`           |
| SL-T025:db                       | P0  | M   | Database    | `supabase/tests/rls/profile_matrix.test.sql`                | 2     | 2.3 | No         | `supabase test db supabase/tests/rls/profile_matrix.test.sql`                                                           | `npm run test:db`                    |
| SL-T026:db                       | P1  | E   | Database    | `supabase/tests/rls/catalog_seed.test.sql`                  | 6     | 6.2 | No         | `supabase test db supabase/tests/rls/catalog_seed.test.sql`                                                             | `npm run test:db`                    |
| SL-T027:e2e                      | P1  | R   | E2E         | `e2e/j01-onboarding.spec.ts`                                | 7     | 7.1 | D14        | `npx playwright test e2e/j01-onboarding.spec.ts --project=chromium`                                                     | `npm run test:e2e`                   |
| SL-T028:unit                     | P0  | E   | Unit        | `src/domains/discovery/eligibility.test.ts`                 | 3     | 3.4 | No         | `npx vitest run --project unit src/domains/discovery/eligibility.test.ts`                                               | `npm run test:unit`                  |
| SL-T029:unit                     | P1  | M   | Unit        | `src/domains/discovery/cohort.test.ts`                      | 6     | 6.3 | No         | `npx vitest run --project unit src/domains/discovery/cohort.test.ts`                                                    | `npm run test:unit`                  |
| SL-T030:integration              | P0  | M   | Integration | `tests/integration/discovery/search.test.ts`                | 3     | 3.4 | Q06        | `npx vitest run --project integration tests/integration/discovery/search.test.ts`                                       | `npm run test:integration:p0`        |
| SL-T031:integration              | P1  | M   | Integration | `tests/integration/discovery/recommendations.test.ts`       | 6     | 6.3 | Q05        | `npx vitest run --project integration tests/integration/discovery/recommendations.test.ts`                              | `npm run test:integration`           |
| SL-T032:unit                     | P1  | M   | Unit        | `src/domains/discovery/recommend.test.ts`                   | 6     | 6.3 | No         | `npx vitest run --project unit src/domains/discovery/recommend.test.ts`                                                 | `npm run test:unit`                  |
| SL-T033:integration              | P1  | M   | Integration | `tests/integration/discovery/density.test.ts`               | 6     | 6.3 | No         | `npx vitest run --project integration tests/integration/discovery/density.test.ts`                                      | `npm run test:integration`           |
| SL-T034:db                       | P1  | E   | Database    | `supabase/tests/rls/discovery.test.sql`                     | 6     | 6.3 | No         | `supabase test db supabase/tests/rls/discovery.test.sql`                                                                | `npm run test:db`                    |
| SL-T035:integration              | P1  | M   | Integration | `tests/integration/discovery/pause.test.ts`                 | 6     | 6.3 | No         | `npx vitest run --project integration tests/integration/discovery/pause.test.ts`                                        | `npm run test:integration`           |
| SL-T036:integration              | P1  | M   | Integration | `tests/integration/discovery/filters.test.ts`               | 6     | 6.3 | No         | `npx vitest run --project integration tests/integration/discovery/filters.test.ts`                                      | `npm run test:integration`           |
| SL-T037:e2e                      | P1  | E   | E2E         | `e2e/j06-cross-platform.spec.ts`                            | 7     | 7.1 | No         | `npx playwright test e2e/j06-cross-platform.spec.ts --project=chromium`                                                 | `npm run test:e2e`                   |
| SL-T038:component                | P2  | M   | Component   | `src/components/discover/DiscoverFilterPanel.test.tsx`      | 8     | 8.1 | No         | `npx vitest run --project component src/components/discover/DiscoverFilterPanel.test.tsx`                               | `npm run test:component`             |
| SL-T039:integration              | P0  | M   | Integration | `tests/integration/connections/send.test.ts`                | 4     | 4.1 | No         | `npx vitest run --project integration tests/integration/connections/send.test.ts`                                       | `npm run test:integration:p0`        |
| SL-T040:db                       | P0  | E   | Database    | `supabase/tests/rls/connections.test.sql`                   | 2     | 2.4 | No         | `supabase test db supabase/tests/rls/connections.test.sql`                                                              | `npm run test:db`                    |
| SL-T041:integration              | P1  | M   | Integration | `tests/integration/connections/transitions.test.ts`         | 6     | 6.4 | No         | `npx vitest run --project integration tests/integration/connections/transitions.test.ts`                                | `npm run test:integration`           |
| SL-T042:db                       | P0  | M   | Database    | `supabase/tests/security/block-propagation.test.sql`        | 2     | 2.4 | Q12        | `supabase test db supabase/tests/security/block-propagation.test.sql`                                                   | `npm run test:db`                    |
| SL-T043:integration              | P1  | M   | Integration | `tests/integration/connections/block.test.ts`               | 6     | 6.4 | No         | `npx vitest run --project integration tests/integration/connections/block.test.ts`                                      | `npm run test:integration`           |
| SL-T044:unit                     | P1  | E   | Unit        | `src/domains/connections/schemas.test.ts`                   | 6     | 6.4 | No         | `npx vitest run --project unit src/domains/connections/schemas.test.ts`                                                 | `npm run test:unit`                  |
| SL-T045:e2e                      | P1  | M   | E2E         | `e2e/connections/connect.spec.ts`                           | 7     | 7.1 | D12        | `npx playwright test e2e/connections/connect.spec.ts --project=chromium`                                                | `npm run test:e2e`                   |
| SL-T046:component                | P1  | M   | Component   | `src/components/connections/ConnectionRequestCard.test.tsx` | 6     | 6.9 | No         | `npx vitest run --project component src/components/connections/ConnectionRequestCard.test.tsx`                          | `npm run test:component`             |
| SL-T047:db                       | P0  | E   | Database    | `supabase/tests/rls/connections.test.sql`                   | 2     | 2.4 | No         | `supabase test db supabase/tests/rls/connections.test.sql`                                                              | `npm run test:db`                    |
| SL-T048:integration              | P2  | M   | Integration | `tests/integration/connections/expiry.test.ts`              | 8     | 8.1 | No         | `npx vitest run --project integration tests/integration/connections/expiry.test.ts`                                     | `npm run test:integration`           |
| SL-T049:db                       | P0  | E   | Database    | `supabase/tests/rls/messages.test.sql`                      | 2     | 2.5 | No         | `supabase test db supabase/tests/rls/messages.test.sql`                                                                 | `npm run test:db`                    |
| SL-T049:realtime                 | P0  | M   | Integration | `tests/integration/messaging/realtime-authz.test.ts`        | 4     | 4.2 | No         | `npx vitest run --project integration tests/integration/messaging/realtime-authz.test.ts`                               | `npm run test:integration:p0`        |
| SL-T050:integration              | P0  | M   | Integration | `tests/integration/messaging/send.test.ts`                  | 4     | 4.2 | Q02/Q08    | `npx vitest run --project integration tests/integration/messaging/send.test.ts`                                         | `npm run test:integration:p0`        |
| SL-T051:notification-db-failure  | P0  | M   | Integration | `tests/integration/messaging/delivery-failure.test.ts`      | 4     | 4.2 | D4/Q07     | `npx vitest run --project integration tests/integration/messaging/delivery-failure.test.ts -t notification-db-failure`  | `npm run test:integration:p0`        |
| SL-T051:email-postcommit-failure | P0  | M   | Integration | `tests/integration/messaging/delivery-failure.test.ts`      | 4     | 4.2 | D4/Q07     | `npx vitest run --project integration tests/integration/messaging/delivery-failure.test.ts -t email-postcommit-failure` | `npm run test:integration:p0`        |
| SL-T052:integration              | P1  | M   | Integration | `tests/integration/messaging/read-state.test.ts`            | 6     | 6.5 | No         | `npx vitest run --project integration tests/integration/messaging/read-state.test.ts`                                   | `npm run test:integration`           |
| SL-T053:integration              | P0  | M   | Integration | `tests/integration/messaging/block.test.ts`                 | 4     | 4.2 | No         | `npx vitest run --project integration tests/integration/messaging/block.test.ts`                                        | `npm run test:integration:p0`        |
| SL-T054:component                | P1  | M   | Component   | `src/components/messaging/MessageComposer.test.tsx`         | 6     | 6.9 | No         | `npx vitest run --project component src/components/messaging/MessageComposer.test.tsx`                                  | `npm run test:component`             |
| SL-T055:realtime-integ           | P0  | M   | Integration | `tests/integration/messaging/realtime.test.ts`              | 4     | 4.2 | No         | `npx vitest run --project integration tests/integration/messaging/realtime.test.ts`                                     | `npm run test:integration:p0`        |
| SL-T055:hook-unmount             | P0  | M   | Component   | `src/domains/messaging/useConversationRealtime.test.tsx`    | 4     | 4.2 | No         | `npx vitest run --project component src/domains/messaging/useConversationRealtime.test.tsx`                             | `npm run test:component`             |
| SL-T056:integration              | P1  | M   | Integration | `tests/integration/messaging/reconnect.test.ts`             | 6     | 6.5 | No         | `npx vitest run --project integration tests/integration/messaging/reconnect.test.ts`                                    | `npm run test:integration`           |
| SL-T057:db                       | P1  | M   | Database    | `supabase/tests/retention/messages.test.sql`                | 6     | 6.5 | No         | `supabase test db supabase/tests/retention/messages.test.sql`                                                           | `npm run test:db`                    |
| SL-T058:integration              | P1  | M   | Integration | `tests/integration/notifications/service.test.ts`           | 6     | 6.5 | No         | `npx vitest run --project integration tests/integration/notifications/service.test.ts`                                  | `npm run test:integration`           |
| SL-T059:integration              | P1  | M   | Integration | `tests/integration/notifications/preferences.test.ts`       | 6     | 6.5 | Q09        | `npx vitest run --project integration tests/integration/notifications/preferences.test.ts`                              | `npm run test:integration`           |
| SL-T060:integration              | P1  | M   | Integration | `tests/integration/email/client.test.ts`                    | 6     | 6.5 | No         | `npx vitest run --project integration tests/integration/email/client.test.ts`                                           | `npm run test:integration`           |
| SL-T061:e2e                      | P1  | P   | E2E         | `e2e/messaging/realtime-chat.spec.ts`                       | 7     | 7.1 | D12        | `npx playwright test e2e/messaging/realtime-chat.spec.ts --project=chromium`                                            | `npm run test:e2e`                   |
| SL-T062:a11y                     | P2  | M   | A11y        | `e2e/a11y/messaging.spec.ts`                                | 8     | 8.1 | Q22        | `npx playwright test e2e/a11y/messaging.spec.ts --project=a11y`                                                         | `npm run test:a11y`                  |
| SL-T063:integration              | P0  | M   | Integration | `tests/integration/play/propose.test.ts`                    | 4     | 4.3 | No         | `npx vitest run --project integration tests/integration/play/propose.test.ts`                                           | `npm run test:integration:p0`        |
| SL-T064:integration              | P0  | M   | Integration | `tests/integration/play/propose-atomicity.test.ts`          | 4     | 4.3 | D5/Q10     | `npx vitest run --project integration tests/integration/play/propose-atomicity.test.ts`                                 | `npm run test:integration:p0`        |
| SL-T065:db                       | P0  | E   | Database    | `supabase/tests/rls/play_invitations.test.sql`              | 2     | 2.6 | No         | `supabase test db supabase/tests/rls/play_invitations.test.sql`                                                         | `npm run test:db`                    |
| SL-T066:integration              | P1  | M   | Integration | `tests/integration/play/transitions.test.ts`                | 6     | 6.6 | No         | `npx vitest run --project integration tests/integration/play/transitions.test.ts`                                       | `npm run test:integration`           |
| SL-T067:integration              | P0  | M   | Integration | `tests/integration/play/sessions.test.ts`                   | 4     | 4.3 | No         | `npx vitest run --project integration tests/integration/play/sessions.test.ts`                                          | `npm run test:integration:p0`        |
| SL-T068:unit                     | P1  | E   | Unit        | `src/domains/play/timezone.test.ts`                         | 6     | 6.6 | No         | `npx vitest run --project unit src/domains/play/timezone.test.ts`                                                       | `npm run test:unit`                  |
| SL-T069:api                      | P1  | M   | API         | `tests/api/play-calendar.test.ts`                           | 6     | 6.6 | No         | `npx vitest run --project api tests/api/play-calendar.test.ts`                                                          | `npm run test:api`                   |
| SL-T070:integration              | P1  | M   | Integration | `tests/integration/play/feedback.test.ts`                   | 6     | 6.6 | No         | `npx vitest run --project integration tests/integration/play/feedback.test.ts`                                          | `npm run test:integration`           |
| SL-T071:integration              | P1  | M   | Integration | `tests/integration/jobs/play-reminders.test.ts`             | 6     | 6.8 | No         | `npx vitest run --project integration tests/integration/jobs/play-reminders.test.ts`                                    | `npm run test:integration`           |
| SL-T072:e2e                      | P1  | P   | E2E         | `e2e/play/full-session.spec.ts`                             | 7     | 7.1 | D12        | `npx playwright test e2e/play/full-session.spec.ts --project=chromium`                                                  | `npm run test:e2e`                   |
| SL-T073:component                | P2  | M   | Component   | `src/components/play/PlayInvitationCard.test.tsx`           | 8     | 8.1 | No         | `npx vitest run --project component src/components/play/PlayInvitationCard.test.tsx`                                    | `npm run test:component`             |
| SL-T074:db                       | P0  | E   | Database    | `supabase/tests/rls/teammate_relationships.test.sql`        | 2     | 2.6 | No         | `supabase test db supabase/tests/rls/teammate_relationships.test.sql`                                                   | `npm run test:db`                    |
| SL-T075:integration              | P1  | M   | Integration | `tests/integration/teammates/lifecycle.test.ts`             | 6     | 6.6 | No         | `npx vitest run --project integration tests/integration/teammates/lifecycle.test.ts`                                    | `npm run test:integration`           |
| SL-T076:db                       | P0  | E   | Database    | `supabase/tests/rls/teammate_relationships.test.sql`        | 2     | 2.6 | No         | `supabase test db supabase/tests/rls/teammate_relationships.test.sql`                                                   | `npm run test:db`                    |
| SL-T077:db                       | P0  | E   | Database    | `supabase/tests/rls/private_groups.test.sql`                | 2     | 2.6 | No         | `supabase test db supabase/tests/rls/private_groups.test.sql`                                                           | `npm run test:db`                    |
| SL-T078:integration              | P0  | M   | Integration | `tests/integration/groups/create.test.ts`                   | 4     | 4.4 | D7/Q11     | `npx vitest run --project integration tests/integration/groups/create.test.ts`                                          | `npm run test:integration:p0`        |
| SL-T079:db                       | P0  | M   | Database    | `supabase/tests/rls/group-approval.test.sql`                | 2     | 2.6 | No         | `supabase test db supabase/tests/rls/group-approval.test.sql`                                                           | `npm run test:db`                    |
| SL-T080:db                       | P0  | R   | Database    | `supabase/tests/rls/group_ownership.test.sql`               | 2     | 2.6 | No         | `supabase test db supabase/tests/rls/group_ownership.test.sql`                                                          | `npm run test:db`                    |
| SL-T081:db                       | P0  | E   | Database    | `supabase/tests/rls/group_messaging.test.sql`               | 2     | 2.6 | Q12        | `supabase test db supabase/tests/rls/group_messaging.test.sql`                                                          | `npm run test:db`                    |
| SL-T081:realtime                 | P0  | M   | Integration | `tests/integration/groups/realtime-authz.test.ts`           | 4     | 4.4 | Q12        | `npx vitest run --project integration tests/integration/groups/realtime-authz.test.ts`                                  | `npm run test:integration:p0`        |
| SL-T082:db                       | P1  | E   | Database    | `supabase/tests/rls/group_open_seats.test.sql`              | 6     | 6.6 | Q12        | `supabase test db supabase/tests/rls/group_open_seats.test.sql`                                                         | `npm run test:db`                    |
| SL-T083:integration              | P1  | M   | Integration | `tests/integration/groups/conversation.test.ts`             | 6     | 6.6 | No         | `npx vitest run --project integration tests/integration/groups/conversation.test.ts`                                    | `npm run test:integration`           |
| SL-T084:e2e                      | P1  | P   | E2E         | `e2e/groups/full-group.spec.ts`                             | 7     | 7.1 | Q12/D12    | `npx playwright test e2e/groups/full-group.spec.ts --project=chromium`                                                  | `npm run test:e2e`                   |
| SL-T085:a11y                     | P2  | M   | A11y        | `e2e/a11y/groups.spec.ts`                                   | 8     | 8.1 | Q22        | `npx playwright test e2e/a11y/groups.spec.ts --project=a11y`                                                            | `npm run test:a11y`                  |
| SL-T086:integration              | P0  | M   | Integration | `tests/integration/moderation/report.test.ts`               | 4     | 4.5 | D6/Q13/Q14 | `npx vitest run --project integration tests/integration/moderation/report.test.ts`                                      | `npm run test:integration:p0`        |
| SL-T087:db                       | P0  | M   | Database    | `supabase/tests/security/report-context.test.sql`           | 2     | 2.7 | No         | `supabase test db supabase/tests/security/report-context.test.sql`                                                      | `npm run test:db`                    |
| SL-T088:integration              | P0  | P   | Integration | `tests/integration/moderation/block-report.test.ts`         | 4     | 4.5 | Q03        | `npx vitest run --project integration tests/integration/moderation/block-report.test.ts`                                | `npm run test:integration:p0`        |
| SL-T089:unit                     | P1  | E   | Unit        | `src/domains/moderation/schemas.test.ts`                    | 6     | 6.7 | Q14        | `npx vitest run --project unit src/domains/moderation/schemas.test.ts`                                                  | `npm run test:unit`                  |
| SL-T090:integration              | P0  | P   | Integration | `tests/integration/admin/authorization.test.ts`             | 4     | 4.6 | Q15        | `npx vitest run --project integration tests/integration/admin/authorization.test.ts`                                    | `npm run test:integration:p0`        |
| SL-T091:db                       | P0  | M   | Database    | `supabase/tests/admin/case-actions.test.sql`                | 2     | 2.7 | No         | `supabase test db supabase/tests/admin/case-actions.test.sql`                                                           | `npm run test:db`                    |
| SL-T092:integration              | P0  | P   | Integration | `tests/integration/admin/evidence.test.ts`                  | 4     | 4.6 | No         | `npx vitest run --project integration tests/integration/admin/evidence.test.ts`                                         | `npm run test:integration:p0`        |
| SL-T093:integration              | P1  | P   | Integration | `tests/integration/admin/appeals.test.ts`                   | 6     | 6.7 | No         | `npx vitest run --project integration tests/integration/admin/appeals.test.ts`                                          | `npm run test:integration`           |
| SL-T094:db                       | P1  | E   | Database    | `supabase/tests/rls/moderation_release.test.sql`            | 6     | 6.7 | No         | `supabase test db supabase/tests/rls/moderation_release.test.sql`                                                       | `npm run test:db`                    |
| SL-T095:integration              | P1  | M   | Integration | `tests/integration/admin/feature-controls.test.ts`          | 6     | 6.7 | No         | `npx vitest run --project integration tests/integration/admin/feature-controls.test.ts`                                 | `npm run test:integration`           |
| SL-T096:integration              | P1  | P   | Integration | `tests/integration/admin/catalog.test.ts`                   | 6     | 6.7 | No         | `npx vitest run --project integration tests/integration/admin/catalog.test.ts`                                          | `npm run test:integration`           |
| SL-T097:db                       | P0  | M   | Database    | `supabase/tests/privacy/export.test.sql`                    | 2     | 2.7 | No         | `supabase test db supabase/tests/privacy/export.test.sql`                                                               | `npm run test:db`                    |
| SL-T098:db                       | P0  | E   | Database    | `supabase/tests/rls/audit_events.test.sql`                  | 2     | 2.2 | No         | `supabase test db supabase/tests/rls/audit_events.test.sql`                                                             | `npm run test:db`                    |
| SL-T099:e2e                      | P1  | M   | E2E         | `e2e/moderation/full-case.spec.ts`                          | 7     | 7.1 | Q15        | `npx playwright test e2e/moderation/full-case.spec.ts --project=chromium`                                               | `npm run test:e2e`                   |
| SL-T100:api                      | P0  | E   | API         | `tests/api/stripe-webhook.test.ts`                          | 4     | 4.7 | No         | `npx vitest run --project api tests/api/stripe-webhook.test.ts`                                                         | `npm run test:api:p0`                |
| SL-T100:unit                     | P0  | E   | Unit        | `src/domains/billing/webhook.test.ts`                       | 4     | 4.7 | No         | `npx vitest run --project unit src/domains/billing/webhook.test.ts`                                                     | `npm run test:unit`                  |
| SL-T101:integration              | P0  | M   | Integration | `tests/integration/billing/webhooks.test.ts`                | 4     | 4.7 | Q19        | `npx vitest run --project integration tests/integration/billing/webhooks.test.ts`                                       | `npm run test:integration:p0`        |
| SL-T102:integration              | P0  | M   | Integration | `tests/integration/billing/webhook-order.test.ts`           | 4     | 4.7 | No         | `npx vitest run --project integration tests/integration/billing/webhook-order.test.ts`                                  | `npm run test:integration:p0`        |
| SL-T103:integration              | P0  | M   | Integration | `tests/integration/billing/resubscribe.test.ts`             | 4     | 4.7 | D3/Q17     | `npx vitest run --project integration tests/integration/billing/resubscribe.test.ts`                                    | `npm run test:integration:p0`        |
| SL-T104:integration              | P0  | M   | Integration | `tests/integration/billing/actions.test.ts`                 | 4     | 4.7 | No         | `npx vitest run --project integration tests/integration/billing/actions.test.ts`                                        | `npm run test:integration:p0`        |
| SL-T105:db                       | P1  | E   | Database    | `supabase/tests/rls/saved_searches.test.sql`                | 6     | 6.7 | No         | `supabase test db supabase/tests/rls/saved_searches.test.sql`                                                           | `npm run test:db`                    |
| SL-T106:integration              | P1  | M   | Integration | `tests/integration/billing/entitlements.test.ts`            | 6     | 6.7 | Q18        | `npx vitest run --project integration tests/integration/billing/entitlements.test.ts`                                   | `npm run test:integration`           |
| SL-T107:integration              | P0  | M   | Integration | `tests/integration/billing/deletion.test.ts`                | 4     | 4.7 | D2/Q16     | `npx vitest run --project integration tests/integration/billing/deletion.test.ts`                                       | `npm run test:integration:p0`        |
| SL-T108:e2e-local-stub           | P1  | P   | E2E         | `e2e/billing/lifecycle.spec.ts`                             | 7     | 7.1 | No         | `npx playwright test e2e/billing/lifecycle.spec.ts --project=chromium`                                                  | `npm run test:e2e`                   |
| SL-T108:e2e-stripe-staging       | P1  | M   | E2E         | `e2e/billing/lifecycle.staging.spec.ts`                     | **7** | 7.2 | No         | `npm run test:e2e:stripe-staging`                                                                                       | `npm run test:e2e:stripe-staging`    |
| SL-T109:db                       | P0  | P   | Database    | `supabase/tests/security/all-tables-rls.test.sql`           | 2     | 2.1 | No         | `supabase test db supabase/tests/security/all-tables-rls.test.sql`                                                      | `npm run test:db`                    |
| SL-T110:api                      | P0  | M   | API         | `tests/api/cron-auth.test.ts`                               | 4     | 4.8 | D1/Q21     | `npx vitest run --project api tests/api/cron-auth.test.ts`                                                              | `npm run test:api:p0`                |
| SL-T111:integration              | P1  | M   | Integration | `tests/integration/jobs/idempotency.test.ts`                | 6     | 6.8 | No         | `npx vitest run --project integration tests/integration/jobs/idempotency.test.ts`                                       | `npm run test:integration`           |
| SL-T112:api                      | P1  | M   | API         | `tests/api/health.test.ts`                                  | 6     | 6.8 | D8/Q20     | `npx vitest run --project api tests/api/health.test.ts`                                                                 | `npm run test:api`                   |
| SL-T113:unit-decision            | P1  | P   | Unit        | `tests/unit/scripts/smoke-post-deploy.test.ts`              | 6     | 6.8 | D8/Q20     | `npx vitest run --project unit tests/unit/scripts/smoke-post-deploy.test.ts`                                            | `npm run test:unit`                  |
| SL-T113:live-staging             | P1  | P   | Smoke       | `scripts/smoke-post-deploy.ts` + post-deploy workflow       | 7     | 7.3 | D8/Q20     | `BASE_URL=$STAGING_URL npm run smoke:post-deploy`                                                                       | post-deploy job (blocks promotion)   |
| SL-T114:unit                     | P0  | M   | Unit        | `src/lib/sentry.test.ts`                                    | 3     | 3.5 | D9         | `npx vitest run --project unit src/lib/sentry.test.ts`                                                                  | `npm run test:unit`                  |
| SL-T115:unit                     | P0  | P   | Unit        | `src/lib/analytics/events.test.ts`                          | 3     | 3.5 | D10        | `npx vitest run --project unit src/lib/analytics/events.test.ts`                                                        | `npm run test:unit`                  |
| SL-T116:a11y                     | P1  | E   | A11y        | `e2e/a11y/journey-routes.spec.ts`                           | 7     | 7.1 | Q22/D15    | `npx playwright test e2e/a11y --project=a11y`                                                                           | `npm run test:a11y`                  |
| SL-T117:a11y                     | P1  | M   | A11y        | `e2e/a11y/keyboard.spec.ts`                                 | 7     | 7.1 | Q22        | `npx playwright test e2e/a11y/keyboard.spec.ts --project=a11y`                                                          | `npm run test:a11y`                  |
| SL-T118:e2e                      | P1  | M   | E2E         | `e2e/responsive/core.spec.ts`                               | 7     | 7.1 | No         | `npx playwright test e2e/responsive/core.spec.ts --project=chromium`                                                    | `npm run test:e2e`                   |
| SL-T119:unit-env                 | P1  | E   | Unit        | `src/lib/env.test.ts`                                       | 6     | 6.8 | D13/Q21    | `npx vitest run --project unit src/lib/env.test.ts`                                                                     | `npm run test:unit`                  |
| SL-T119:ci-env-gate              | P1  | M   | CI          | `.github/workflows/ci.yml` job `env-production-gate`        | 6     | 6.8 | D13        | `gh run` / job logs                                                                                                     | required check `env-production-gate` |
| SL-T120:load                     | P2  | P   | Perf        | `scripts/load/messaging-realtime.k6.ts`                     | 8     | 8.2 | No         | `npm run test:load:realtime`                                                                                            | nightly/release                      |

**T108:** both implementations in **Phase 7** (not Phase 8).  
**T113:** unit + live-staging both required.  
**T006:** uses `signInWithPasswordThroughApi()` only (not UI helper).  
**T049:** no Q12. **T081** carries Q12. **T050** rate-limit key depends on **Q02** (mandatory Phase 0).

---

## F. Defect register D1–D15

| ID  | Defect                                        |
| --- | --------------------------------------------- |
| D1  | Cron fail-open without `CRON_SECRET`          |
| D2  | Deletion proceeds after Stripe cancel failure |
| D3  | Canceled read-only blocked from checkout      |
| D4  | Message before notification/email             |
| D5  | Invitation before time options                |
| D6  | Report before case                            |
| D7  | Group invite errors ignored                   |
| D8  | Health degraded → 200                         |
| D9  | Sentry scrub shallow / unwired                |
| D10 | Analytics property scrub absent               |
| D11 | Identity split writes                         |
| D12 | Playwright shared mutable seed state          |
| D13 | Incomplete production env validation          |
| D14 | Magic-link-first E2E auth bypass              |
| D15 | CI a11y global `testIgnore` zeros a11y suite  |

---

## G. Product decisions (`docs/testing/product-decisions.json`)

**Schema fields per decision:** `id`, `status`, `owner`, `dueDate`, `approvedAnswer`, `approver`, `approvedAt`, `affectedImplementationKeys[]`, `contractArtifact`, `failureBehavior`, `implementationPackage`, `environments?`.

**Q01** remains one parent with children fields `local` / `staging` / `production` (not Q01a/b/c IDs).

| ID  | Topic                                         | Hard gate for                                                            |
| --- | --------------------------------------------- | ------------------------------------------------------------------------ |
| Q01 | Email confirmation (local/staging/production) | T003:integration, T006, T008; staging smoke asserts hosted               |
| Q02 | Durable rate limiting                         | **T004:***, **T050:integration** (mandatory)                             |
| Q03 | Report after block                            | T088                                                                     |
| Q04 | Availability overlaps                         | T021                                                                     |
| Q05 | Intent expiry                                 | T031                                                                     |
| Q06 | Visibility matrix                             | T023, T030 → `docs/product/profile-visibility-matrix.md`                 |
| Q07 | Message+notify model                          | T051:* — expected state **from approved answer only**                    |
| Q08 | Link confirm vs flag                          | T050                                                                     |
| Q09 | Notification prefs                            | T059                                                                     |
| Q10 | Play invite+slots RPC                         | T064                                                                     |
| Q11 | Group initial invites                         | T078                                                                     |
| Q12 | Group co-member block                         | T042, T081:*, T082, T084 → `docs/product/group-block-behavior-matrix.md` |
| Q13 | Report+case atomicity                         | T086                                                                     |
| Q14 | Severity authority                            | T086, T089                                                               |
| Q15 | AAL2 method (denial-only invalid)             | T090, T099                                                               |
| Q16 | Deletion vs Stripe cancel                     | T014, T107                                                               |
| Q17 | Resubscribe checkout                          | T103                                                                     |
| Q18 | Excess data on downgrade                      | T106                                                                     |
| Q19 | Stripe status mapping                         | T101 → `docs/product/stripe-status-contract.md`                          |
| Q20 | Health degraded code                          | T112, T113:*                                                             |
| Q21 | Cron fail-closed                              | T110, T119:*                                                             |
| Q22 | Axe serious+critical                          | T116, T117, T062, T085                                                   |
| Q23 | Storage local+hosted                          | ops; split local vs hosted S3/vector                                     |

**Recommended defaults — not approved** until decision row filled. No Package A–E code without approved contract.

### Production contracts

Files: `docs/testing/contracts/package-a.json` … `package-e.json`.  
Each `coShipsWith` implementation must reference `contractRef`.  
`test:traceability:phase` fails if contract missing, unapproved, or contains placeholders (`maybe`/`likely`/`TBD`).

**Package A deploy order:** (1) secrets configured+verified (2) preview/staging deploy (3) env+cron probes (4) scheduled-job auth confirm (5) promote. Never deploy-then-set-secret.

---

## H. Failure injection (late-stage, deterministic)

| Key                           | After prior write would succeed | Mechanism                                                                                          | Expected (after Q approved)                                 |
| ----------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| T017                          | Profile display_name committed  | Injected `accounts.update` repository throws on timezone write                                     | Per Package E — no half state                               |
| T051:notification-db-failure  | —                               | Unique violation on notifications inside **same** txn as message                                   | Zero message + zero notification **if** Q07 chooses one txn |
| T051:email-postcommit-failure | Message+notification committed  | `resendAdapter.send` throws                                                                        | Per Q07 (outbox only if Q07 selects outbox)                 |
| T064                          | Invitation row would persist    | RPC body includes valid invitation + slot write that hits CHECK after invitation insert inside RPC | Zero orphan invitations                                     |
| T078                          | Group created                   | Nth `invite_to_group` returns error after group exists                                             | Per Q11                                                     |
| T086                          | —                               | Single RPC; force exception after report insert would have occurred inside RPC                     | Zero orphan reports                                         |
| T101                          | Event row inserted              | Handler throws after persist before entitlement apply                                              | Defined event state; replay safe                            |
| T014/T107                     | —                               | `stripeAdapter.cancelSubscription` throws after password OK                                        | Per Q16                                                     |

---

## I. Standalone architecture (restored)

### Server-action harness (`tests/support/action-context.ts`)

Must mock/capture: cookie jar, `cookies()`, `headers()`, `redirect()`, `revalidatePath`/`revalidateTag`, `server-only` boundary, redirect exceptions.  
`createFixtureAdmin()` ≠ `createActorClient(session)`.  
Self-test: `tests/integration/support/action-context.self.test.ts` proves auth action, RLS deny, redirect capture, cache-call capture, cleanup, service-role separation.

### Auth helpers

| Helper                              | Use                            |
| ----------------------------------- | ------------------------------ |
| `generateAdminSession`              | Fixture admin only             |
| `createAuthenticatedFixtureSession` | Non-auth journeys              |
| `signInWithPasswordThroughApi`      | **T006** and actor integration |
| `signInThroughUi`                   | Browser auth journeys only     |

Prohibit admin magic-link sessions in auth-proving tests (**D14**).

### Fixtures / time / global state

**Users:** anonymous, onboarding_attestation, onboarding_profile, active_free_a/b/c, active_plus, past_due_grace, past_due_readonly, canceled_readonly, restricted, suspended, deletion_pending, deleted, safety_admin_aal1/aal2, catalog_admin_aal2, break_glass_aal2, support_aal2.

**Scenarios:** legal holds, job_runs, rich export user, recovery codes, revoked sessions, ordered Stripe events, evidence-view state, concurrency barriers, run-scoped cleanup IDs, unique cohort keys.

**Support files:** `guards.ts`, `supabase.ts`, `action-context.ts`, `factories/*.ts`, `cleanup.ts`, `clock.ts`, `sql-time.ts`, `flags.ts`, `concurrency.ts`, `stripe.ts`, `resend.ts`, `analytics.ts`, `sentry.ts`, `network.ts`.

**Rules:** per-test run ID; cleanup registry; JS timers vs SQL explicit timestamps / injected `p_now`; advisory locks for flags/caps; cleanup before retries; **CI forbids** `KEEP_FAILED_FIXTURES`; post-suite leak assertion; namespace includes `project+worker+parallel+runId+retry`.

### Network allowlist

Intercept **fetch/Undici**, Node **http/https**, and **WebSocket**. Self-test: external HTTPS blocked; local Supabase REST+Realtime allowed.

### External mocks

Stripe/Resend/PostHog/Sentry injectable adapters. PR E2E: checkout stub. Staging Stripe: separate config (§K).

### T109 expectations (chosen format: SQL)

`supabase/tests/security/relation_security_expectations.sql` table: relation, classification, anon grants, authenticated grants, service_role grants, policy ops, public_catalog_justification.  
`supabase/tests/security/service_role_fixture_grants.test.sql` + allowlist table for fixture-admin ops.  
Delete `deny_default.test.sql` after T109 lands.

### Concurrency

Default: two actor clients + barrier. Do not use `pg_background` unless Phase 1 proves it.

### Realtime layer split

pgTAP = RLS; integration = subscribe authz/order/reconnect; component = unmount; E2E = two-browser delivery.

---

## J. Vitest / scripts / coverage

**Pin:** Phase 1 records and locks the newest tested compatible **Vitest 3.2.x** (same version for `@vitest/coverage-v8`) before lockfile change. Later major requires explicit migration package — not silent `≥`.

Projects with `extends: true`; alias self-tests import **side-effect-free** `@/lib/auth/safe-redirect` (not `@/lib/env`).

Paths: harness under `tests/integration/support/`; smoke unit under `tests/unit/scripts/`.

```json
{
  "test": "vitest run --project unit",
  "test:unit": "vitest run --project unit",
  "test:component": "vitest run --project component",
  "test:api": "tsx scripts/run-with-local-supabase.ts -- vitest run --project api",
  "test:api:p0": "tsx scripts/run-with-local-supabase.ts -- vitest run --project api -t @p0",
  "test:integration": "tsx scripts/run-with-local-supabase.ts -- vitest run --project integration",
  "test:integration:p0": "tsx scripts/run-with-local-supabase.ts -- vitest run --project integration -t @p0",
  "test:coverage": "tsx scripts/run-with-local-supabase.ts -- vitest run --project unit --project component --project api --project integration --coverage",
  "test:all": "npm run test:unit && npm run test:component && npm run test:api && npm run test:integration",
  "test:db": "supabase test db",
  "test:e2e": "playwright test --project=chromium",
  "test:e2e:p0": "playwright test --project=chromium-p0",
  "test:e2e:mobile": "playwright test --project=mobile",
  "test:e2e:full": "playwright test --project=chromium --project=mobile",
  "test:e2e:stripe-staging": "playwright test -c playwright.staging.config.ts --project=stripe-staging",
  "test:a11y": "playwright test --project=a11y",
  "test:e2e:flake": "playwright test --project=chromium --repeat-each=3 --retries=0",
  "test:load:realtime": "k6 run scripts/load/messaging-realtime.k6.ts",
  "test:migration-drift": "tsx scripts/check-migration-drift.ts",
  "test:types:check": "tsx scripts/check-generated-types.ts",
  "test:retention:large-batch": "tsx scripts/run-large-batch-retention.ts",
  "test:traceability:plan": "tsx scripts/verify-test-traceability.ts --mode=plan",
  "test:traceability:phase": "tsx scripts/verify-test-traceability.ts --mode=phase",
  "test:traceability:release": "tsx scripts/verify-test-traceability.ts --mode=release",
  "smoke:post-deploy": "tsx scripts/smoke-post-deploy.ts"
}
```

Phase commands: `npm run test:traceability:phase -- --phase=2` (etc.).

### Coverage rollout

| When             | Gate                                                             |
| ---------------- | ---------------------------------------------------------------- |
| Phase 1          | Generate+archive; **no** fail thresholds                         |
| Each phase close | Ratchet floors ≥ accepted baseline                               |
| Phase 6 close    | Enforce 70% lines / 80% domain branches / 90% security-sensitive |
| Release          | No exemptions                                                    |

---

## K. Playwright configs

**`playwright.config.ts` (local/CI):** build once in CI job; `webServer.command = "npm run start"`; readiness `GET /api/health` must return approved healthy JSON (not mere HTTP ok/redirect); full env map (Supabase URL/keys, `NEXT_PUBLIC_SITE_URL`); projects chromium-p0 / chromium / mobile / a11y; `testIgnore` staging specs on ordinary projects; a11y ignore **only** on chromium/mobile — **not** global.

**`playwright.staging.config.ts`:** **no** `webServer`; requires `STAGING_BASE_URL` HTTPS matching approved staging host; fail if localhost or production.

**T118:** Chromium CDP device metrics / reduced viewport for reflow; **plus** manual 200% browser-zoom evidence in release a11y — CSS `zoom` alone does **not** satisfy.

**Namespace:** `project + workerIndex + parallelIndex + RUN_ID + testInfo.retry`.

---

## L. CI / isolation / branch protection

### Suite isolation on shared DB

Between pgTAP → API → integration → coverage: **`supabase db reset`** (chosen).  
Between e2e:p0 → a11y: reset or proven isolation + leak check.  
`KEEP_FAILED_FIXTURES` off in CI.  
`supabase stop` in `if: always()`.

### Key export

Parse status JSON → `::add-mask::` → `$GITHUB_ENV` (never echo secrets).

### Migration drift (`npm run test:migration-drift`)

```bash
supabase db diff --local --schema public,auth > /tmp/diff.sql
# fail if non-empty (ignore approved headers)
supabase gen types typescript --local > src/lib/supabase/database.types.ts
git diff --exit-code -- src/lib/supabase/database.types.ts
```

Hosted staging drift: main/nightly only, protected credentials.

### Branch-protection transition matrix (required)

| Check                                        | Activates when             | Phase   |
| -------------------------------------------- | -------------------------- | ------- |
| `quality`                                    | planning merge             | 0       |
| `database` / `db-security-integration` pgTAP | exists                     | 0/1     |
| `test:api:p0` required                       | PR adding first API P0     | 3/4     |
| `test:integration:p0` required               | PR adding first integ P0   | 3/4     |
| `test:e2e:p0` required                       | PR adding first e2e P0     | 3       |
| `test:a11y` required                         | after D15 fix + first a11y | 0B/7    |
| `env-production-gate`                        | Phase 6                    | 6       |
| `migration-drift`                            | Phase 1                    | 1       |
| `test:traceability:phase --phase=N`          | phase-close PR             | each    |
| `test:traceability:release`                  | final                      | release |

Same PR that adds first genuine P0 suite **enables** that required check before merge.

### Artifacts

| Type                      | Retention | Access          | Upload       |
| ------------------------- | --------- | --------------- | ------------ |
| Traces/screenshots/videos | 14 days   | eng maintainers | failure only |
| Coverage HTML/LCOV        | 30 days   | eng             | always on PR |
| DB logs                   | 7 days    | eng             | failure      |
| k6/ZAP                    | 90 days   | eng+founder     | release      |

Pre-upload scan: `tsx scripts/scan-artifacts-for-secrets.ts`. Prohibited: real emails, JWTs, message/report bodies. Incident owner: founder. Delete within 24h of sensitive capture.

### Tool pins (record in baseline artifacts)

- Node: exact patch from `node -v` on green baseline
- Supabase CLI: minimum that parses config (document why 2.20.12 failed)
- Vitest + coverage-v8: exact 3.2.x
- `@playwright/test`: lockfile; browsers from that version
- k6: pin container digest
- ZAP: pin image digest

---

## M. Phase summaries (generated from inventory — illustrative)

Hand lists are **non-authoritative**. CI regenerates `docs/testing/generated/phase-*.md`.

| Phase      | Objective                                                                          |
| ---------- | ---------------------------------------------------------------------------------- |
| 0 / 0B     | Baseline + a11y fix D15 + CLI/Node pins                                            |
| Post-merge | Decisions + Package A–E contracts                                                  |
| 1          | Infra, harness, guards, expectations SQL, CI, branch matrix; coverage archive only |
| 2          | P0 DB packages; same-PR security fixes if red                                      |
| 3          | Auth/account/profile/discovery P0 + T001/T010/T017 + obs unit                      |
| 4          | Domain P0 + T014 + realtime impls + Packages A–D as linked                         |
| 6          | Remaining P1 + components; coverage thresholds on                                  |
| 7          | P1 E2E/a11y/responsive + **both T108** + **T113 live**                             |
| 8          | P2 only + load/ZAP; **DEFERRED rejects P0/P1**                                     |

Phase 2 policy: if intended P0 fails, ship policy/grant/RPC/migration in **same** package.

---

## N. SL-T120 thresholds

100 subs; 5 min steady; ≥99% delivery; p95 ≤2s; join error <1%; 0 duplicate IDs; 0 unauthorized. Phoenix join/heartbeat/token/correlation/teardown in k6 task. Staging host allowlist.

---

## O. Release contracts (must be complete before Phase 8)

Every row needs trigger, owner, env, command script, threshold, artifact path, max evidence age, blocking|deferred, deferral approval.

| Task                  | Script                                     | Blocking                | Evidence age                                 |
| --------------------- | ------------------------------------------ | ----------------------- | -------------------------------------------- |
| Full chromium+mobile  | `test:e2e:full`                            | main                    | 7d                                           |
| Stripe staging        | `test:e2e:stripe-staging`                  | release                 | 7d                                           |
| Staging smoke         | `smoke:post-deploy`                        | promotion               | 24h                                          |
| ZAP                   | pinned image                               | release                 | 30d                                          |
| k6 realtime           | `test:load:realtime`                       | release                 | 30d                                          |
| Large-batch retention | `test:retention:large-batch`               | release                 | dataset: 10k messages / 1k deletion requests |
| NVDA/VoiceOver        | checklist in `docs/testing/manual-a11y.md` | release                 | 30d                                          |
| Backup/restore        | runbook                                    | DEFERRED needs approval | —                                            |

---

## P. Q23 Storage

Split local vs hosted. If disable: Storage + S3-compatible + vector off locally; hosted restricted; assert no buckets/public policies; verify hosted before release. If retain: written justification + policy checks.

---

## Q. Definition of Done

1. 120 IDs; all implementations exist with markers
2. Zero P0/P1 skip/todo/fixme; blocked manifest empty/absent
3. P2 pass or inventory `disposition=deferred` with approval (P2 only)
4. Coverage at Phase-6 thresholds
5. `test:traceability:release` green
6. unit/component/api/integration/db/e2e:p0/e2e:full/a11y/build/env-gate/migration-drift/types-check/staging smoke green
7. Both T108 implementations green (Phase 7)
8. T113 live-staging green post-deploy
9. Branch protection matrix applied; failing P0 cannot merge
10. Load thresholds met or P2 deferred properly
11. D1–D15 closed or superseded by approved contract
12. Final SHA reconciliation
13. Docs/contracts/inventory committed; artifact policy followed

---

## R. Risks / rollback

Never remove CI to go green. Never restore cron fail-open. Forward-fix migrations. Per-package rollback validation. Reconcile SHA each package.

---

**Mapped:** 120 requirement IDs; multi-implementation keys as listed.  
**No repository application/test/CI code was modified by this planning edit.**
