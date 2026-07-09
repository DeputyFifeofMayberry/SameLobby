# Staging billing validation checklist

Run on **https://staging.samelobby.com** after deploy and Stripe webhook registration.

## Prerequisites

- [ ] `STRIPE_*` env vars set on Vercel (test mode)
- [ ] Webhook endpoint live: `/api/webhooks/stripe`
- [ ] `plans.stripe_price_id` matches Dashboard price IDs
- [ ] Test user with completed onboarding

## Steps

1. **Flag off (default)** — `/subscription` shows rollout message; no checkout buttons (`stripe_enabled=false`).
2. **Enable billing** — Set `stripe_enabled=true` in `/admin/feature-controls`.
3. **Checkout** — Free user → `/subscription` → password re-auth → Upgrade monthly → Stripe test card `4242...` → success redirect.
4. **Webhook** — Confirm `entitlements.tier = plus`, limits 25/10/10; `subscriptions.status = active`.
5. **Portal** — Manage in Stripe → cancel at period end → status `cancel_at_period_end`; Plus limits until period end.
6. **Read-only** — After simulated lapse (or test webhook), confirm mutations blocked with billing copy; reads still work.
7. **Safety** — Report/block flows show **no** upgrade CTA ([`e2e/j12-block-report.spec.ts`](../../e2e/j12-block-report.spec.ts)).

## Rollback

Set `stripe_enabled=false` if checkout issues block beta.
