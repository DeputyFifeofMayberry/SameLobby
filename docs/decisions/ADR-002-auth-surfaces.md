# ADR-002: Auth surfaces and password authentication

**Status:** Accepted  
**Date:** 2026-07-08  
**Context:** Slice 1 originally specified magic-link-only auth. Product direction requires separate account-creation and login pages with email + password.

## Decision

- **Separate public routes:** `/sign-up` (create account) and `/sign-in` (returning members).
- **Credentials:** Email + password via Supabase Auth (`signUp`, `signInWithPassword`, `resetPasswordForEmail`).
- **Post-auth routing:** Account status drives redirect (`onboarding` → attestation, `active` → discover).
- **Registration control:** `registration_open` feature flag enforced server-side on sign-up only.
- **Email confirmation:** Disabled locally (`enable_confirmations = false`); enable in staging/production before public release.
- **Magic link:** Removed as primary login; `/auth/callback` retained for email confirmation and password recovery only.

## Consequences

- Deviates from Slice 1 plan wording (magic link as sole auth method). ADR documents intentional change.
- Password policy aligned in app (Zod) and `supabase/config.toml` (min 8, letters + digits).
- Sensitive account field updates (status, attestation) use service role after session verification; DB trigger blocks client tampering.

## Related

- [ADR-001](./ADR-001-stack.md)
- Slice 1.1 implementation in `src/domains/auth/`
