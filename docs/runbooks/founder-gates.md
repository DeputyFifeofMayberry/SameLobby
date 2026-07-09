# Founder gates — staging beta

Track manual sign-offs required before widening beta or enabling public registration.

## R06 — Legal (CRITICAL)

**Required before `registration_open = true`.**

| Document | Version | Counsel review | Date | Initials |
|----------|---------|----------------|------|----------|
| Terms of Service | | ☐ | | |
| Privacy Policy | | ☐ | | |
| Age attestation copy | | ☐ | | |
| Community standards / moderation policy | | ☐ | | |

**Engineering posture:** `registration_open` remains **false** on staging until this table is complete.

## R07 — Catalog anchors

Verify crossplay metadata for 8 anchor games via `/admin/catalog` (catalog scope):

| Game | Reviewed | `reviewed_at` current | Notes |
|------|----------|----------------------|-------|
| Fortnite | ☐ | | |
| Minecraft | ☐ | | |
| Rocket League | ☐ | | |
| Call of Duty | ☐ | | |
| Apex Legends | ☐ | | |
| Destiny 2 | ☐ | | |
| Overwatch 2 | ☐ | | |
| Valorant | ☐ | | |

## Accessibility — manual sign-off

Before inviting external beta users:

| Journey | NVDA | VoiceOver | Date | Tester |
|---------|------|-----------|------|--------|
| J01 Onboarding | ☐ | ☐ | | |
| J07 Messaging | ☐ | ☐ | | |
| J12 Safety (block/report) | ☐ | ☐ | | |

Automated axe gate: CI `npm run test:a11y` on journey routes.

## Stripe (staging beta)

| Step | Done | Date |
|------|------|------|
| Test checkout → webhook → Plus entitlements | ☐ | |
| Portal cancel at period end | ☐ | |
| Read-only after lapse | ☐ | |
| `stripe_enabled=true` on staging | ☐ | |

## R09 — Stripe Tax

Deferred until accounting review. Do not enable Stripe Tax without finance sign-off.
