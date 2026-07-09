# Slice 10 launch checklist

Use this runbook before a capped public release. Engineering gates should be green in CI; founder gates require explicit sign-off.

## CI / engineering gates

- [ ] `npm run typecheck` passes
- [ ] `npm run test` (Vitest) passes
- [ ] `npm run test:db` (pgTAP) passes
- [ ] `npm run build` passes with `SKIP_ENV_VALIDATION=true`
- [ ] Playwright E2E job green (`npm run test:e2e`)
- [ ] axe accessibility specs green (`npm run test:a11y`)
- [ ] Post-deploy smoke script passes (`npm run smoke:post-deploy`)

## Stripe / billing

- [ ] Staging checkout → webhook → entitlements verified
- [ ] `plans.stripe_price_id` matches Stripe Dashboard test/production prices
- [ ] Portal cancel flow tested
- [ ] Read-only mode verified after subscription lapse

## Launch controls

- [ ] `registration_open` remains **false** until R06 legal sign-off
- [ ] Registration numeric cap set on `/admin/feature-controls`
- [ ] Registration cap utilization visible on admin dashboard
- [ ] Feature flags reviewed (messaging, discovery, reporting)

## Security & compliance

- [ ] R06: Legal counsel sign-off on terms, privacy, age attestation, moderation policy
- [ ] OWASP ZAP baseline on staging (document results)
- [ ] Admin MFA enforced for safety/catalog scopes

## Data & catalog

- [ ] Catalog ≥150 games in seed/migrations
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
