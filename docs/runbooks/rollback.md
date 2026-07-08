# Rollback procedure

## Application rollback (Vercel)

1. Open Vercel project → Deployments.
2. Select last known-good deployment → **Promote to Production** (or restore preview).
3. Confirm `/api/health` returns `200` with `database: ok`.

## Emergency feature disable (no deploy)

1. Set `registration_open = false` in `feature_flags` (Supabase SQL editor or admin UI in Slice 8). This blocks new signups via the `hook_before_user_created` Auth hook and the `/sign-up` server action.
2. Optionally disable `connection_requests_enabled` / `messaging_enabled`.
3. Record action in `audit_events` when admin console is available.

## Database rollback

- **Do not** run destructive `db reset` on production.
- Ship forward-fix migrations only.
- If a migration fails mid-deploy: stop traffic, restore from last tested backup snapshot, apply corrected migration on staging first.

## Auth incidents

1. Rotate Supabase JWT secret / service role if compromised.
2. Invalidate sessions via Supabase dashboard if required.
3. Pause registration via feature flag until verified.
