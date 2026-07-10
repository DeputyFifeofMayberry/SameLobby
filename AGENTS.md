# Agent instructions — SameLobby test program

Agents working on SameLobby tests must follow `SAMELOBBY_TEST_IMPLEMENTATION_BUILD_PLAN.md` (v4).

## Approval gate

**Planning is NOT approved for implementation.** Until the planning PR merges and product decisions Q01–Q23 are closed:

- Docs/inventory/traceability tooling only (Phases 0–0B).
- No Vitest 3.2.x upgrade, harness, or SL-T test implementation unless baseline remediation requires it.

## Required reads

1. `SAMELOBBY_TEST_IMPLEMENTATION_BUILD_PLAN.md`
2. `tests/test-inventory.json` — find your implementation key, phase, package
3. `docs/testing/canonical-anchors.md` — setup/steps/expected for the SL-T ID
4. `docs/testing/product-decisions.json` — do not assume defaults for open Q## items

## Traceability commands

```bash
npm run test:traceability:plan
npm run test:traceability:phase -- --phase=2
npm run test:traceability:release
```

Planning PR must pass `test:traceability:plan`. Phase-close PRs must pass the matching phase mode.

## Implementation rules

- Use title markers from inventory (`titleMarker` field).
- Never hand-edit requirement-level aggregates in inventory.
- Regenerate `docs/testing/generated/*` after inventory changes; header must be `Generated from tests/test-inventory.json — do not edit`.
- `coShipsWith` implementations share package delivery; `contractRef` must point to approved package JSON in release mode.
- Skip/todo/fixme on P0/P1 is forbidden at release.

## Auth helpers (when implementing)

| Helper                              | Use                        |
| ----------------------------------- | -------------------------- |
| `generateAdminSession`              | Fixture admin only         |
| `createAuthenticatedFixtureSession` | Non-auth journeys          |
| `signInWithPasswordThroughApi`      | T006 and actor integration |
| `signInThroughUi`                   | Browser auth journeys only |

Do not use admin magic-link sessions in auth-proving tests (D14).

## Baseline remediation (Phase 0B)

Authorized without full program approval:

- D15: move a11y `testIgnore` to chromium/mobile projects only; a11y project must list tests > 0 under `CI=true`
- Tool pins, CI key export fixes, other baseline blockers documented in §C

## Do not

- Edit `SAMELOBBY_TEST_IMPLEMENTATION_BUILD_PLAN.md` in place on feature branches without explicit approval workflow
- Remove CI checks to go green
- Restore cron fail-open (D1)
- Implement Package A–E behavior without approved contracts

## Testing entrypoint

See `TESTING.md` for suite commands and local setup.
