# J01 — New user creates a profile

**Journey:** 19.1 | **Screens:** Onboarding → Profile preview → Discover

## User goal

Create a trustworthy gamer identity without a personality test or unnecessary personal disclosure.

## Flow

```
Sign up (email magic link)
  → Adult attestation (18+ checkbox + Terms, Privacy, Community Standards)
  → Display name + time zone
  → First game + playable platform
  → Communication capability (≥1 mode required)
  → Current goal (friendship / specific game / etc.)
  → Profile preview (discoverable view)
  → Discover (recommendations OR density empty state)
```

## Required actions

- Verify email
- Attest 18+ privately
- Complete minimum fields (under ~3 minutes target)
- Review visibility summary

## Optional (later prompts)

Avatar, availability, playstyle, interests, environment boundaries, introduction, group preferences, age range — each with **Skip**.

## System response

- Validate required fields
- Explain public vs match-only fields
- Calculate platform/cross-play compatibility for first game
- Route to Discover or density state

## Safety controls

- Policy consent recorded with version + timestamp
- No photo upload in MVP
- Sensitive preferences default match-only
- Rate limits on sign-up
- Links disabled in introduction for new accounts

## Success outcome

User reaches Discover with minimum profile, one game/platform, one communication mode, one current goal.

## Friction mitigations

- Progress indicator
- "Why we ask" microcopy
- Skip on every optional field
- No quiz score or archetype

## States

See `docs/design/states.md` — Onboarding, Discover.

## A11y

See `docs/design/a11y/J01-onboarding.md`.
