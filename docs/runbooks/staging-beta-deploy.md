# Staging beta deploy runbook

Execute after `main` includes Slices 9–10 (`70714d0` or later). Target: **https://staging.samelobby.com**.

## 1. Push and CI

```bash
git push origin main
gh run list --branch main --limit 3
```

Confirm jobs **database**, **quality**, and **e2e** are green.

## 2. Database migrations

```bash
supabase login
supabase link --project-ref <STAGING_PROJECT_REF>
supabase db push
```

New migrations (Slices 9–10):

- `20260716000000_billing.sql`
- `20260717000000_catalog_admin_rls.sql`
- `20260717010000_moderation_case_notes.sql`
- `20260717020000_registration_cap.sql`
- `20260717030000_catalog_seed_expansion.sql`

Verify:

```sql
select count(*) from public.games;
select key, stripe_price_id from public.plans;
select key, enabled, metadata from public.feature_flags where key in ('registration_open', 'registration_cap', 'stripe_enabled');
```

## 3. Vercel environment (staging)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Staging Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Staging service role |
| `NEXT_PUBLIC_SITE_URL` | `https://staging.samelobby.com` |
| `CRON_SECRET` | Random secret for cron routes |
| `STRIPE_SECRET_KEY` | Stripe **test** secret |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard webhook |
| `STRIPE_PRICE_PLUS_MONTHLY` | Test price ID |
| `STRIPE_PRICE_PLUS_ANNUAL` | Test price ID |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional |
| `SENTRY_DSN` | Optional |

Do **not** set `SKIP_ENV_VALIDATION` on staging/production.

Update `plans.stripe_price_id` to match Dashboard price IDs:

```sql
update public.plans set stripe_price_id = '<price_monthly>' where key = 'plus_monthly';
update public.plans set stripe_price_id = '<price_annual>' where key = 'plus_annual';
```

## 4. Stripe webhook (staging)

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://staging.samelobby.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel

Local forwarding:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 5. Deploy and smoke

Vercel deploys from `main` automatically. After deploy:

```bash
BASE_URL=https://staging.samelobby.com npm run smoke:post-deploy
```

## 6. Capped beta defaults

On staging (via `/admin/feature-controls` or SQL):

- `registration_open` = **false** (until R06 legal)
- `registration_cap` metadata `max_accounts` = **100** (adjust 50–200 as needed)
- Core flags: `discovery_enabled`, `messaging_enabled`, `connection_requests_enabled`, etc. = **true**
- `stripe_enabled` = **true** only after billing smoke (see [launch-checklist.md](./launch-checklist.md))

## 7. Rollback

See [rollback.md](./rollback.md).
