# Slice 10 launch checklist

Use this runbook before a capped public release. Engineering gates should be green in CI; founder gates require explicit sign-off.

## CI / engineering gates

- [x] `npm run typecheck` passes (CI quality job, run `29056717943`)
- [x] `npm run test` (Vitest) passes
- [x] `npm run test:db` (pgTAP) passes
- [x] `npm run build` passes with `SKIP_ENV_VALIDATION=true`
- [ ] Playwright E2E job green (`npm run test:e2e`) — in progress on `main`
- [ ] axe accessibility specs green (`npm run test:a11y`)
- [x] Post-deploy smoke script passes (`npm run smoke:post-deploy` on staging, 2026-07-09)

## Stripe / billing

- [ ] Staging checkout → webhook → entitlements verified
- [ ] `plans.stripe_price_id` matches Stripe Dashboard test/production prices
- [ ] Portal cancel flow tested
- [ ] Read-only mode verified after subscription lapse

## Launch controls

- [x] `registration_open` remains **false** until R06 legal sign-off (staging verified)
- [x] Registration numeric cap set on `/admin/feature-controls` (staging: `max_accounts=100`)
- [ ] Registration cap utilization visible on admin dashboard
- [x] Feature flags reviewed (messaging, discovery, reporting enabled on staging)

## Security & compliance

- [ ] R06: Legal counsel sign-off on terms, privacy, age attestation, moderation policy
- [ ] OWASP ZAP baseline on staging (document results)
- [ ] Admin MFA enforced for safety/catalog scopes

## Data & catalog

- [x] Catalog ≥150 games in seed/migrations (staging: 150)
- [ ] 8 anchor games crossplay metadata verified (R07)
- [ ] Backup restore rehearsal scheduled (quarterly)

## Accessibility & QA

- [ ] axe: zero **critical** violations on journey routes
- [ ] Manual NVDA/VoiceOver pass on onboarding + messaging

## Observability

- [ ] `NEXT_PUBLIC_POSTHOG_KEY` set in production (optional locally)
- [ ] `SENTRY_DSN` set in production (optional locally)
- [ ] Session replay disabled on `/messages` and `/admin`

## Rollback

1. Set `registration_open = false` in feature flags
2. Lower registration cap if needed
3. Revert Vercel deployment if required — see [rollback.md](./rollback.md)

## Founder prerequisites (manual)

| Item                              | Owner                   | Tracker |
| --------------------------------- | ----------------------- | ------- |
| Legal review (R06)                | Founder + counsel       | [founder-gates.md](./founder-gates.md) |
| Stripe production keys + webhook  | Founder                 | [staging-beta-deploy.md](./staging-beta-deploy.md) |
| Registration cap number           | Founder                 | `/admin/feature-controls` |
| Catalog anchor verification (R07) | Founder + catalog admin | [founder-gates.md](./founder-gates.md) |
| Manual a11y sign-off              | Founder/QA              | [founder-gates.md](./founder-gates.md) |
| OWASP ZAP baseline                | Engineering             | [zap-baseline.md](./zap-baseline.md) |
