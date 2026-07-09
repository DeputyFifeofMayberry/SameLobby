# Staging and domain setup (samelobby.com)

Staging URL target: **https://staging.samelobby.com**  
Apex **samelobby.com**: parked / coming-soon until public launch.

## Prerequisites

- GitHub repo: [DeputyFifeofMayberry/SameLobby](https://github.com/DeputyFifeofMayberry/SameLobby)
- Domain: **samelobby.com** (Namecheap)
- Vercel team: `deputyfifeofmayberrys-projects`
- Supabase org: same account as other projects

## 1. Supabase staging project

> **Free tier limit:** If project creation fails with “maximum limits for active free projects”, pause or delete an unused Supabase project in the dashboard, or upgrade the org plan.

1. Create project **SameLobby-staging** (region `us-east-2` recommended).
2. Link locally:
   ```bash
   supabase login
   supabase link --project-ref <PROJECT_REF>
   ```
3. Push migrations:
   ```bash
   supabase db push
   ```
4. **Authentication → URL configuration**
   - Site URL: `https://staging.samelobby.com`
   - Redirect URLs:
     - `https://staging.samelobby.com/auth/callback`
     - `https://staging.samelobby.com/auth/reset-password`
     - `http://localhost:3000/auth/callback` (local dev)
5. **Authentication → Hooks**
   - Enable `before_user_created` → `public.hook_before_user_created` (applied via migration `20260708190000`)
6. **Authentication → Providers → Email**
   - Enable email confirmations for staging (recommended before wider testing)
7. Copy from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only)

## 2. Vercel project

**Status:** Project `deputyfifeofmayberrys-projects/samelobby` is linked to GitHub `DeputyFifeofMayberry/SameLobby`. Domains `samelobby.com` and `staging.samelobby.com` are added in Vercel.

1. Open [Vercel → samelobby](https://vercel.com/deputyfifeofmayberrys-projects/samelobby) (or import if needed).
2. Framework: Next.js (auto-detected).
3. **Environment variables** (Production + Preview; use staging Supabase values):

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
   | `NEXT_PUBLIC_SITE_URL` | `https://staging.samelobby.com` |

4. Deploy from `main` branch.
5. **Settings → Domains** → Add `staging.samelobby.com`. Note the DNS target Vercel shows (usually `cname.vercel-dns.com`).

CLI alternative (after `vercel login`):
```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_SITE_URL
vercel --prod
```

## 3. Namecheap DNS

In **Domain List → samelobby.com → Advanced DNS**:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `staging` | `76.76.21.21` | Automatic (or 300) |

Vercel recommends this A record for `staging.samelobby.com` while Namecheap remains the DNS provider (nameservers stay on registrar-servers.com).

Alternative: point nameservers to Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) to manage all DNS in Vercel.

For apex (optional coming-soon):
- Use Namecheap parking, or
- Vercel apex A record per Vercel docs when ready for production.

DNS propagation: up to 24–48 hours; often minutes.

## 4. Smoke tests

```bash
BASE_URL=https://staging.samelobby.com npm run smoke:post-deploy
curl -f https://staging.samelobby.com/api/health
```

See [staging-beta-deploy.md](./staging-beta-deploy.md) for migrations, Stripe webhook, and env vars.

Manual:

1. `/sign-up` → attestation → `/discover`
2. `/sign-in` with seed user `dev-active@test.local` / `TestPass123!` (after seed on staging DB if needed)
3. Set `registration_open = false` in `feature_flags` → sign-up blocked at UI and Auth hook
4. Forgot password flow

## 5. Rollback

See [rollback.md](./rollback.md). Disable `registration_open` first; revert Vercel deployment if needed.

## Local development

Copy `.env.example` to `.env.local` and fill Supabase local or staging keys. Never commit `.env.local`.

```bash
supabase start
supabase db reset
npm run dev
```
