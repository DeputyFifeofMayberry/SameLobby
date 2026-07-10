# samelobby Test Implementation Plan

Repository reviewed: DeputyFifeofMayberry/SameLobby  
Branch and baseline: main at 47547ad38e08f012ba5c97f022478319cc014caa  
Prepared: July 9, 2026

## 1. Executive Summary

SameLobby is an adult gamer friendship and teammate platform built with Next.js 16, React 19, TypeScript, Supabase Auth/PostgreSQL/Realtime, Stripe, Resend, PostHog, Sentry, Vercel Cron, Vitest, pgTAP, Playwright, and axe.

Primary personas:

- Anonymous visitor
- Onboarding, active, restricted, suspended, deletion-pending, and deleted users
- Connected player or teammate
- Private-group owner, admin, member, or invitee
- Safety reviewer, support, catalog administrator, billing administrator, and security break-glass administrator
- Background-job and webhook service identities

Major functional areas include authentication, adult attestation, profile onboarding, discovery, connections, blocking, messaging, play invitations, sessions, teammates, private groups, moderation, account privacy/deletion, subscriptions, administration, notifications, analytics, scheduled jobs, and launch controls.

Existing automated coverage:

| Layer                        |      Files |                  Logical checks |
| ---------------------------- | ---------: | ------------------------------: |
| Vitest unit                  |         16 |                Approximately 81 |
| pgTAP/database               |         32 |          104 planned assertions |
| Playwright E2E/accessibility |         17 |                 36 source tests |
| Post-deploy smoke            |   1 script |                  3 route checks |
| Load                         | 1 scaffold | Health/auth/messages route only |

Highest-risk gaps:

1. The deny-default RLS test covers only the original six tables, not every later table.
2. Most server actions lack integration tests for authentication, authorization, feature flags, read-only accounts, zero-row updates, and partial failures.
3. Several E2E journeys stop before completing the mutation they claim to protect.
4. Messaging, play invitations, reports, and group creation can partially succeed before a later operation fails.
5. Canceled accounts appear unable to initiate the checkout needed to resubscribe because checkout calls requireWritableAccount.
6. Account deletion continues after Stripe cancellation failure, risking continued billing.
7. Cron routes allow unauthenticated execution when CRON_SECRET is missing.
8. Realtime lifecycle, duplicate events, reconnection, notification delivery, and email opt-outs are almost entirely untested.
9. Admin testing covers denial without AAL2 but not successful AAL2 workflows or scope separation.
10. Playwright projects mutate shared seed records, making desktop/mobile execution order-dependent.

Recommended strategy: preserve the current Vitest, pgTAP, Playwright, and axe foundation; add integration tests around server actions and route handlers; expand pgTAP into a complete authorization matrix; add focused component tests for interactive state; and replace shared mutable E2E state with scenario-specific factories.

## 2. App Functionality Map

| Area                 | Relevant files                                | Intended behavior                                                   | Important states/failures                                                   | Security/data dependencies                 |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------ |
| Registration/sign-in | src/domains/auth, auth components, middleware | Password registration/sign-in controlled by flags and cap           | Closed/full registration, invalid credentials, rate limits, unsafe redirect | Supabase Auth, accounts, feature_flags     |
| Password recovery    | Forgot/reset forms and auth callback          | Send recovery email and establish recovery session                  | Invalid/expired code, missing session, password mismatch                    | Supabase Auth redirect configuration       |
| Adult attestation    | accounts actions, form, account RPC           | Record 18+ and policy consents atomically                           | Missing consent, deleted account, RPC/admin-client failure                  | accounts, consent_events, policy versions  |
| Account routing      | account-guard, middleware                     | Route account statuses to permitted surfaces                        | Expired session, missing profile, restricted/deletion status                | Cookies, accounts, gamer_profiles          |
| Profile onboarding   | profile domain, onboarding pages/components   | Collect identity, games, communication, goal, availability, preview | Duplicate name, invalid platform, incomplete profile, partial update        | Profile tables, catalog, entitlements, RLS |
| Profile/privacy      | Profile pages and disclosure settings         | Edit profile and control field visibility                           | Cross-user access and hidden-field leakage                                  | RLS and server field filtering             |
| Catalog              | games domain and catalog admin                | Maintain 150 games, platforms, cross-play data                      | Invalid platform sets, inactive games, stale review                         | Catalog scope and audit                    |
| Discovery            | discovery domain and UI                       | Apply density and eligibility rules, then rank matches              | Paused/expired intent, block, incomplete profile, stale recommendations     | Blocks, current intents, server-only data  |
| Connections          | connections domain and UI                     | Send/accept/decline/cancel requests; block/unblock                  | Duplicates, expiry, limits, self-action, read-only                          | Connection RPCs and ordered pairs          |
| Messaging            | messaging domain and UI                       | Direct/group messaging with realtime and limits                     | Nonmember, block, duplicate event, connection loss                          | Membership, messages RLS, Realtime         |
| Notifications/email  | notification service and email client         | Create in-app notifications and optional email                      | Opt-out, missing recipient, vendor failure, duplicate send                  | Service role, preferences, Resend          |
| Play                 | play domain, pages, calendar API              | Invite, schedule, create session, confirm, collect feedback         | Expired/block, bad time, partial insert, wrong participant                  | Invitation/session RPCs and time zones     |
| Teammates            | teammates domain                              | Mutual teammate relationships after completed sessions              | No completed session, one-sided intent, block                               | Teammate RPCs/private notes                |
| Private groups       | groups domain and UI                          | Invitation-only groups, approvals, chat, open seats                 | Group limit, partial invites, unauthorized role action                      | Group RPCs, entitlements, membership RLS   |
| Moderation           | moderation/admin domains                      | Reports, cases, evidence, actions, appeals, release                 | Case failure, bad context, scope/AAL2 failure                               | Case-scoped RLS and audit logs             |
| Privacy/deletion     | Settings, account actions, deletion jobs      | Export data and staged deletion with legal holds                    | Stripe failure, hold, retry, incomplete purge                               | Sessions, Stripe, retention, legal holds   |
| Billing              | billing domain and Stripe route               | Free/Plus lifecycle, checkout, portal, saved searches               | Invalid signature, duplicates, grace, lapse, resubscribe                    | Stripe, plans, subscriptions, entitlements |
| Administration       | Admin pages/actions                           | Scope-separated safety, catalog, feature controls                   | Wrong scope, missing AAL2, unaudited evidence view                          | admin_users, MFA, service role             |
| Scheduled jobs       | Cron routes, jobs, vercel.json                | Reminders, message purge, deletion processing                       | Missing secret, duplicate run, partial batch                                | job_runs and service role                  |
| Observability        | Analytics, Sentry, health, smoke/load         | Safe telemetry and dependency health                                | PII leak, false-positive health                                             | PostHog, Sentry, feature flags             |
| Uploads/media        | No application upload code found              | No upload behavior implemented                                      | N/A                                                                         | Supabase Storage enabled but unused        |

## 3. Existing Test Coverage Review

### Current test infrastructure

| Item                | Current state                                |
| ------------------- | -------------------------------------------- |
| Unit framework      | Vitest 3, Node environment                   |
| Component framework | None installed; no React component tests     |
| Database framework  | pgTAP through supabase test db               |
| E2E framework       | Playwright with desktop Chromium and Pixel 7 |
| Accessibility       | axe; only critical violations fail           |
| Fixtures            | Shared seed plus e2e/fixtures/auth.ts        |
| CI                  | Database, quality, then E2E on PR and main   |
| Coverage reporting  | None                                         |
| Test isolation      | E2E mutates shared seeded records            |

### Vitest test files

| File                                      | Coverage                                      | Assessment/action                                 |
| ----------------------------------------- | --------------------------------------------- | ------------------------------------------------- |
| src/domains/accounts/schemas.test.ts      | Attestation/deletion validation               | Keep; add policy/action boundaries                |
| src/domains/auth/schemas.test.ts          | Signup/sign-in/recovery/reset schemas         | Keep; expand normalization/boundaries             |
| src/lib/auth/safe-redirect.test.ts        | Redirect allowlist                            | Expand encoded/backslash/control cases            |
| src/lib/env.test.ts                       | Skip validation and service-role key          | Expand production cron/Stripe/vendor requirements |
| src/domains/profile/schemas.test.ts       | Names, communication, completeness            | Expand availability/enums/Plus limits             |
| src/domains/connections/schemas.test.ts   | Request limits and links                      | Expand Unicode/action behavior                    |
| src/domains/discovery/eligibility.test.ts | Self/block/shared play/cross-play             | Expand expiry/visibility/cohort/ranking           |
| src/domains/messaging/schemas.test.ts     | Body, links, rate cap, icebreakers            | Expand boundaries, obfuscated links, actions      |
| src/domains/groups/schemas.test.ts        | Approval and entitlement limit                | Expand name/size/invite/emblem validation         |
| src/domains/play/schemas.test.ts          | Scheduling, links, helpers                    | Expand dates, ownership, state transitions        |
| src/domains/play/timezone.test.ts         | Formatting, UTC, ICS basics                   | Expand DST, invalid zones, injection/escaping     |
| src/domains/teammates/schemas.test.ts     | Mutual intent and notes                       | Expand eligibility/transitions                    |
| src/domains/moderation/schemas.test.ts    | Severity keywords                             | Expand report/appeal limits and false positives   |
| src/domains/billing/constants.test.ts     | Free/Plus limits                              | Keep                                              |
| src/domains/billing/stripe-status.test.ts | Stripe status mapping                         | Expand incomplete/trialing/unpaid/paused          |
| src/domains/billing/webhook.test.ts       | Duplicate, failure cleanup, missing signature | Substantially expand all event types              |

### pgTAP test files

| File                                                | Coverage                              | Assessment/action                             |
| --------------------------------------------------- | ------------------------------------- | --------------------------------------------- |
| supabase/tests/000_setup.test.sql                   | Helpers/setup                         | Keep                                          |
| supabase/tests/rls/deny_default.test.sql            | RLS on six initial tables             | Rewrite dynamically for every exposed table   |
| supabase/tests/rls/accounts.test.sql                | Own/cross-user reads and updates      | Expand sensitive fields/statuses              |
| supabase/tests/rls/accounts_protection.test.sql     | Prevent self-activation               | Expand all protected states/fields            |
| supabase/tests/rls/consent_events.test.sql          | Own insert/read                       | Expand versions/event integrity               |
| supabase/tests/rls/deletion_requests.test.sql       | Own request, duplicate, cross-user    | Expand states/read/update/delete              |
| supabase/tests/rls/feature_flags.test.sql           | Anonymous/authenticated read          | Expand metadata exposure/write denial         |
| supabase/tests/rls/gamer_profiles.test.sql          | Own profile and catalog read          | Expand discoverable visibility                |
| supabase/tests/rls/environment_preferences.test.sql | Own/cross-user reads                  | Expand writes/validation                      |
| supabase/tests/rls/discovery.test.sql               | Own profiles, blocks, reasons         | Expand recommendation/demand isolation        |
| supabase/tests/rls/connections.test.sql             | Visibility, accept, block             | Expand transitions, race, conversation        |
| supabase/tests/rls/messages.test.sql                | Member send, nonmember/block denial   | Expand spoofing/group/update/delete           |
| supabase/tests/rls/reports.test.sql                 | Report insert/read and block behavior | Expand case/evidence/context                  |
| supabase/tests/rls/play_invitations.test.sql        | Insert/read/block                     | Expand acceptance, time option, expiry        |
| supabase/tests/rls/gaming_sessions.test.sql         | Participant/nonparticipant read       | Expand authorized state transitions           |
| supabase/tests/rls/post_play_feedback.test.sql      | Own/private feedback                  | Expand completed-session requirement          |
| supabase/tests/rls/teammate_relationships.test.sql  | Relationships and private notes       | Expand RPC lifecycle                          |
| supabase/tests/rls/private_groups.test.sql          | Owner create, nonmember, free limit   | Expand membership and Plus limit              |
| supabase/tests/rls/group_ownership.test.sql         | RPC callable                          | Rewrite to prove authorization/results        |
| supabase/tests/rls/group_messaging.test.sql         | Conversation/pre-join denial          | Expand member/removed/block cases             |
| supabase/tests/rls/group_open_seats.test.sql        | Member insert                         | Expand roles, spoofing, lifecycle             |
| supabase/tests/rls/appeals.test.sql                 | One appeal/duplicate denial           | Expand subject/action/admin resolution        |
| supabase/tests/rls/audit_events.test.sql            | Update denial                         | Expand insert/delete/select/immutability      |
| supabase/tests/rls/moderation_evidence.test.sql     | Nonadmin denial/admin read            | Expand case scope and audit                   |
| supabase/tests/rls/deletion_pipeline.test.sql       | Completion/legal hold                 | Expand stages/retry/session revocation        |
| supabase/tests/rls/catalog_admin.test.sql           | Catalog scope                         | Expand other scopes, validation, audit        |
| supabase/tests/rls/catalog_seed.test.sql            | 150 games, anchors, platforms         | Expand active-only/review timestamps          |
| supabase/tests/rls/subscriptions.test.sql           | Own plan/subscription reads           | Expand writes/lifecycle                       |
| supabase/tests/rls/entitlements.test.sql            | Defaults/isolation/free denial        | Expand Plus/grace/canceled/resubscribe        |
| supabase/tests/rls/saved_searches.test.sql          | Plus CRUD/ownership                   | Expand limit, duplicate, invalid filters      |
| supabase/tests/rls/billing_webhook_events.test.sql  | Auth read/insert denial               | Expand service role/immutability              |
| supabase/tests/rls/moderation_release.test.sql      | Release eligibility                   | Expand restoration/audit/isolation            |
| supabase/tests/rls/registration_cap.test.sql        | Last signup and cap rejection         | Expand disabled cap/deleted count/concurrency |

### Playwright test files

| File                                  | Coverage                           | Assessment/action                        |
| ------------------------------------- | ---------------------------------- | ---------------------------------------- |
| e2e/j01-onboarding.spec.ts            | Attestation gate/preseeded profile | Rewrite as full onboarding               |
| e2e/j02-specific-game.spec.ts         | Game-filtered results              | Add empty/error/blocked cases            |
| e2e/j03-friendship.spec.ts            | Goal filter                        | Expand beyond seeded smoke               |
| e2e/j04-interruption-friendly.spec.ts | Opens invite form                  | Submit and verify persistence            |
| e2e/j05-clean-communication.spec.ts   | Communication UI                   | Replace brittle keyword checks           |
| e2e/j06-cross-platform.spec.ts        | Compatible profile                 | Add incompatible exclusion               |
| e2e/j07-connect-message.spec.ts       | Send/reload message                | Add connection and realtime peer         |
| e2e/j08-play-invite.spec.ts           | Creates invite                     | Add acceptance/session                   |
| e2e/j09-post-play.spec.ts             | Selects feedback                   | Save and verify feedback                 |
| e2e/j10-group.spec.ts                 | Creates group/invite               | Add approval/activation/chat             |
| e2e/j11-profile-games.spec.ts         | Add/remove game                    | Keep with isolated fixture               |
| e2e/j12-block-report.spec.ts          | Opens report/clicks block          | Rewrite to submit/verify both            |
| e2e/j13-teammate-unavailable.spec.ts  | Creates open seat                  | Add authorization/lifecycle              |
| e2e/admin-moderation.spec.ts          | AAL2 denial                        | Add AAL2 success/scope matrix            |
| e2e/billing-readonly.spec.ts          | Lapsed read/write behavior         | Add resubscription                       |
| e2e/billing-upgrade.spec.ts           | Password-required checkout         | Reach checkout                           |
| e2e/a11y/journey-routes.spec.ts       | Critical axe violations            | Fail serious and test interactive states |

## 4. Recommended Testing Strategy

| Category           | Tool                                       | Location                     | Mock                              | Do not mock                      | CI                           |
| ------------------ | ------------------------------------------ | ---------------------------- | --------------------------------- | -------------------------------- | ---------------------------- |
| Unit               | Vitest                                     | Collocated .test.ts          | Clock/random/vendor adapters      | Pure business rules              | Every PR                     |
| Component          | Vitest, jsdom, Testing Library, user-event | src/components/**/*.test.tsx | Server actions/navigation         | DOM interaction/focus            | Every PR                     |
| Server integration | Vitest plus local Supabase                 | tests/integration            | Stripe, Resend, analytics         | Auth/RLS/database                | P0/P1 every PR               |
| API                | Vitest importing handlers                  | tests/api                    | Jobs/vendor SDK where needed      | Parsing/auth/status              | Every PR                     |
| Database           | pgTAP                                      | supabase/tests               | Nothing                           | Constraints, triggers, RLS, RPCs | Every PR                     |
| E2E                | Playwright                                 | e2e                          | Stripe redirect only if necessary | App/Auth/database                | Critical PR; full nightly    |
| Accessibility      | axe plus Playwright/manual                 | e2e/a11y                     | Nothing                           | Rendered UI/keyboard             | Automated PR; manual release |
| Security           | pgTAP/integration/ZAP                      | tests/security               | Vendors only                      | Authorization                    | P0 PR; ZAP nightly/release   |
| Smoke              | tsx/Playwright                             | scripts and e2e/smoke        | Nothing                           | Deployed environment             | Post-deploy                  |

Rules:

- Test names state actor, action, and expected result.
- Use deterministic clocks.
- Use unique users/data per worker and project.
- Every mutation receives unauthenticated, wrong-owner, invalid-state, feature-disabled, read-only, failure, and success tests as applicable.
- Do not mock Supabase where the test is intended to prove RLS, constraints, RPC atomicity, or service-role separation.
- Avoid snapshots except small stable email or ICS payloads after explicit sensitive-data assertions.
- Initial coverage target: 80% branches for pure domain modules, 70% global lines, and 90% branches for security-sensitive modules.

## 5. Complete Test Inventory

| Test ID | Priority | Type          | Area          | Feature / Flow                                                   | Test Description                                                                              | Preconditions / Setup  | Steps                       | Expected Result                             | Suggested File Path                                       | Notes                          |
| ------- | -------- | ------------- | ------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------- | --------------------------- | ------------------------------------------- | --------------------------------------------------------- | ------------------------------ |
| SL-T001 | P0       | E2E           | Auth          | Protected routing                                                | Anonymous access to every app/admin prefix redirects to sign-in and renders no protected data | No session             | Visit representative routes | Safe redirect with next path                | e2e/auth/protected-routes.spec.ts                         | New                            |
| SL-T002 | P0       | Unit          | Auth          | Account guard                                                    | Parameterize every account status, profile state, and route category                          | Status matrix          | Call redirect helpers       | Exact allowed/redirected path               | src/domains/accounts/account-guard.test.ts                | New                            |
| SL-T003 | P0       | Integration   | Auth          | Registration controls                                            | Closed or capped registration fails before user creation                                      | Toggle flags/cap       | Submit valid signup         | Generic error; no user/account rows         | tests/integration/auth/registration.test.ts               | Expand cap SQL                 |
| SL-T004 | P1       | Unit          | Auth          | Rate limits                                                      | Auth counters enforce limits and reset after window                                           | Fake clock             | Repeat limiter calls        | Correct allow/deny/retry                    | src/lib/rate-limit.test.ts                                | Process-local limiter          |
| SL-T005 | P0       | Database      | Auth          | Provisioning                                                     | Auth user creation atomically creates account, profile, free entitlements once                | Insert auth user       | Query tables                | One linked row each                         | supabase/tests/auth/provisioning.test.sql                 | New                            |
| SL-T006 | P0       | Integration   | Auth          | Sign-in                                                          | Invalid email/password are indistinguishable; valid users route by status                     | Status users           | Submit credentials          | No enumeration; correct redirect            | tests/integration/auth/sign-in.test.ts                    | New                            |
| SL-T007 | P0       | API           | Auth          | Callback                                                         | Valid, invalid, expired, recovery, and unsafe-next callbacks redirect safely                  | Code fixtures          | Call route                  | No open redirect                            | tests/api/auth-callback.test.ts                           | New                            |
| SL-T008 | P1       | Integration   | Auth          | Recovery                                                         | Existing/nonexistent emails return identical success                                          | Mock reset provider    | Submit emails               | Same result and safe logging                | tests/integration/auth/password-reset.test.ts             | New                            |
| SL-T009 | P1       | Component     | Auth          | Reset form                                                       | Cover mismatch, weak password, pending, error, success, focus                                 | Mock client            | Interact                    | Accessible states                           | src/components/auth/ResetPasswordForm.test.tsx            | New                            |
| SL-T010 | P0       | E2E           | Auth          | Session expiry                                                   | Revoked/expired session cannot remain protected                                               | Revoke session         | Reload/navigate             | Redirect and safe cookie state              | e2e/auth/session-expiry.spec.ts                           | New                            |
| SL-T011 | P0       | Integration   | Account       | Attestation                                                      | All consents create versioned events and activate atomically                                  | Onboarding user        | Submit form                 | Active account and four consent events      | tests/integration/accounts/attestation.test.ts            | Existing schema/SQL partial    |
| SL-T012 | P0       | Security      | Account       | Attestation auth                                                 | Cross-account/deleted/deletion-pending/partial attempts fail                                  | Status users           | Invoke action/RPC           | No protected changes                        | supabase/tests/rls/attestation.test.sql                   | New                            |
| SL-T013 | P0       | Integration   | Account       | Deletion request                                                 | Request is idempotent and schedules 30-day purge                                              | Active user            | Submit twice                | One request; pending status                 | tests/integration/accounts/deletion-request.test.ts       | Expand                         |
| SL-T014 | P0       | Integration   | Account       | Deletion confirm                                                 | Wrong password fails; Stripe cancellation failure follows approved policy                     | Stripe subscription    | Confirm deletion            | No silent continued billing                 | tests/integration/accounts/deletion-confirmation.test.ts  | Current risk                   |
| SL-T015 | P0       | Database      | Account       | Deletion pipeline                                                | Stages are idempotent; legal hold pauses; sessions revoke                                     | Requests/hold          | Run repeatedly              | Correct retained/purged data                | supabase/tests/rls/deletion_pipeline.test.sql             | Expand                         |
| SL-T016 | P0       | Integration   | Onboarding    | Step enforcement                                                 | Direct actions cannot skip required steps                                                     | Fresh active user      | Call out of order           | Rejected or required redirect               | tests/integration/profile/onboarding-order.test.ts        | New                            |
| SL-T017 | P0       | Integration   | Profile       | Identity atomicity                                               | Time-zone write failure cannot leave half-complete identity                                   | Inject failure         | Save identity               | Rollback/recoverable state                  | tests/integration/profile/identity.test.ts                | Current split writes           |
| SL-T018 | P1       | Unit          | Profile       | Schema bounds                                                    | Names, Unicode, enums, intro and invalid times                                                | Boundary inputs        | Parse                       | Exact validation                            | src/domains/profile/schemas.test.ts                       | Expand                         |
| SL-T019 | P0       | Database      | Profile       | Game integrity                                                   | Reject nonexistent/incompatible game-platform and entitlement overflow                        | Free/Plus users        | Insert/action               | Constraint/action rejection                 | supabase/tests/rls/user_games.test.sql                    | New                            |
| SL-T020 | P1       | Integration   | Profile       | Goal/intent                                                      | Create/update produces one active 14-day intent                                               | Seed user              | Save/change goal            | One refreshed intent                        | tests/integration/profile/current-intent.test.ts          | New                            |
| SL-T021 | P1       | Database      | Profile       | Availability                                                     | Start before end; day/overlap policy enforced                                                 | Seed user              | Insert windows              | Approved behavior                           | supabase/tests/rls/availability.test.sql                  | Confirm overlaps               |
| SL-T022 | P0       | Integration   | Profile       | Completion gate                                                  | Missing any required profile data blocks completion                                           | Remove prerequisites   | Complete                    | Specific error                              | tests/integration/profile/completeness.test.ts            | Expand                         |
| SL-T023 | P0       | Security      | Profile       | Visibility                                                       | Fields respect public/match/connection/private viewers                                        | Viewer matrix          | Fetch bundle                | No hidden leakage                           | tests/integration/profile/visibility.test.ts              | New                            |
| SL-T024 | P1       | Integration   | Profile       | Game editing                                                     | Duplicate, limit and final-game removal cases                                                 | Entitlement users      | Add/remove                  | Correct count/errors                        | tests/integration/profile/games.test.ts                   | Existing E2E partial           |
| SL-T025 | P0       | Security      | Profile       | Ownership                                                        | User cannot modify another profile-related row                                                | Users A/B              | Direct mutations            | Zero unauthorized changes                   | supabase/tests/rls/profile_matrix.test.sql                | New                            |
| SL-T026 | P1       | Database      | Catalog       | Invariants                                                       | Active games/platforms/anchors/review data remain valid                                       | Seed catalog           | Query                       | All invariants pass                         | supabase/tests/rls/catalog_seed.test.sql                  | Expand                         |
| SL-T027 | P1       | E2E           | Onboarding    | Full journey                                                     | New user completes attestation and onboarding to Discover                                     | Unique user            | Complete UI                 | Persisted complete profile                  | e2e/j01-onboarding.spec.ts                                | Rewrite                        |
| SL-T028 | P0       | Unit          | Discovery     | Eligibility                                                      | Expired/paused/restricted/incomplete/private/blocked/incompatible candidates exclude          | Candidate matrix       | Evaluate                    | Stable ineligibility                        | src/domains/discovery/eligibility.test.ts                 | Expand                         |
| SL-T029 | P1       | Unit          | Discovery     | Cohort                                                           | Threshold 39/40, key, region, anchor deterministic                                            | Fixed candidates       | Call helpers                | Exact results                               | src/domains/discovery/cohort.test.ts                      | New                            |
| SL-T030 | P0       | Integration   | Discovery     | Secure search                                                    | Search excludes private/blocked and never leaks own-only data                                 | Mixed candidates       | Search                      | Safe summaries only                         | tests/integration/discovery/search.test.ts                | New                            |
| SL-T031 | P1       | Integration   | Discovery     | Recommendation lifecycle                                         | Max 12, 24-hour expiry, stale removal, no duplicates                                          | Seed cohort            | Refresh/advance             | Stable current set                          | tests/integration/discovery/recommendations.test.ts       | New                            |
| SL-T032 | P1       | Unit          | Discovery     | Ranking                                                          | Tie-break/reasons deterministic and popularity-free                                           | Equal candidates       | Rank repeatedly             | Stable output                               | src/domains/discovery/recommend.test.ts                   | New                            |
| SL-T033 | P1       | Integration   | Discovery     | Density gate                                                     | 39 users show demand collection and no recommendations                                        | 39-user cohort         | Load/refresh                | Correct empty state                         | tests/integration/discovery/density.test.ts               | New                            |
| SL-T034 | P1       | Database      | Discovery     | Demand signal                                                    | Opt-in owned, unique, idempotent, hidden cross-user                                           | Users A/B              | Insert/read                 | One own signal                              | supabase/tests/rls/discovery.test.sql                     | Expand                         |
| SL-T035 | P1       | Integration   | Discovery     | Pause/resume                                                     | Pause removes user; resume restores eligibility                                               | Discoverable user      | Toggle                      | Immediate visibility change                 | tests/integration/discovery/pause.test.ts                 | New                            |
| SL-T036 | P1       | Integration   | Discovery     | Filters                                                          | Malformed/empty/no-result searches handled safely                                             | Auth user              | Submit filters              | Sanitized/empty states                      | tests/integration/discovery/filters.test.ts               | New                            |
| SL-T037 | P1       | E2E           | Discovery     | Cross-play                                                       | Compatible match appears; incompatible does not                                               | Candidate fixtures     | Search                      | Correct inclusion/exclusion                 | e2e/j06-cross-platform.spec.ts                            | Expand                         |
| SL-T038 | P2       | Component     | Discovery     | UI states                                                        | Loading, disabled, density, result and error states accessible                                | Mock props/actions     | Render/interact             | Correct announcements                       | src/components/discover/DiscoverFilterPanel.test.tsx      | New                            |
| SL-T039 | P0       | Integration   | Connections   | Send request                                                     | Enforce auth/status/flag/self/visibility/block/limits/duplicate                               | Scenario users         | Submit                      | Only valid persists                         | tests/integration/connections/send.test.ts                | New                            |
| SL-T040 | P0       | Database      | Connections   | Accept atomicity                                                 | Recipient only; unexpired/unblocked; concurrent accept creates one connection/conversation    | Pending request        | Concurrent accept           | Single relationship                         | supabase/tests/rls/connections.test.sql                   | Expand                         |
| SL-T041 | P1       | Integration   | Connections   | Decline/cancel                                                   | Correct actor/state and zero-row updates fail                                                 | Request matrix         | Invoke                      | Exact transitions                           | tests/integration/connections/transitions.test.ts         | New                            |
| SL-T042 | P0       | Security      | Connections   | Block propagation                                                | Block hides required profiles/requests/conversations/invites/sessions/relationships           | Connected pair         | Block/query                 | All boundaries enforced                     | supabase/tests/security/block-propagation.test.sql        | New                            |
| SL-T043 | P1       | Integration   | Connections   | Unblock                                                          | Only blocker unblocks; ended access not restored silently                                     | Block record           | Unblock as actors           | Correct state                               | tests/integration/connections/block.test.ts               | New                            |
| SL-T044 | P1       | Unit          | Connections   | Request note                                                     | Length, Unicode and link patterns                                                             | Inputs                 | Parse                       | Approved boundaries                         | src/domains/connections/schemas.test.ts                   | Expand                         |
| SL-T045 | P1       | E2E           | Connections   | Full connect                                                     | Discover, request, accept, see connection/conversation                                        | Two contexts           | Complete flow               | Mutual relationship                         | e2e/connections/connect.spec.ts                           | New                            |
| SL-T046 | P1       | Component     | Connections   | Request card                                                     | Pending/error/success and rapid-click protection                                              | Mock actions           | Interact                    | One call and accessible result              | src/components/connections/ConnectionRequestCard.test.tsx | New                            |
| SL-T047 | P0       | Database      | Connections   | Mutation security                                                | Prevent spoofed sender/recipient/pair/status outside RPC                                      | Users A/B/C            | Direct mutations            | Rejection                                   | supabase/tests/rls/connections.test.sql                   | Expand                         |
| SL-T048 | P2       | Integration   | Connections   | Expiry                                                           | Requests older than 14 days cannot accept                                                     | Expired request        | Read/accept                 | Expired error/state                         | tests/integration/connections/expiry.test.ts              | New                            |
| SL-T049 | P0       | Security      | Messaging     | Membership                                                       | Nonmember cannot read/send/update/subscribe direct or group                                   | Users A/B/C            | Table/realtime              | Complete denial                             | supabase/tests/rls/messages.test.sql                      | Expand                         |
| SL-T050 | P0       | Integration   | Messaging     | Send action                                                      | Enforce status/read-only/flag/membership/permission/block/length/link/rate                    | Conversation matrix    | Send                        | Only valid persists                         | tests/integration/messaging/send.test.ts                  | New                            |
| SL-T051 | P0       | Integration   | Messaging     | Side-effect failure                                              | Notification/email failure cannot create retry duplicates                                     | Inject failure         | Send/retry                  | Defined atomic/outbox result                | tests/integration/messaging/delivery-failure.test.ts      | Current risk                   |
| SL-T052 | P1       | Integration   | Messaging     | Read tracking                                                    | Opening updates correct read timestamps/notifications only                                    | Unread fixtures        | Open                        | Correct rows read                           | tests/integration/messaging/read-state.test.ts            | New                            |
| SL-T053 | P0       | Integration   | Messaging     | Block in chat                                                    | Target must belong; arbitrary conversation ID cannot be changed                               | Multiple conversations | Tamper IDs                  | Correct conversation only                   | tests/integration/messaging/block.test.ts                 | New                            |
| SL-T054 | P1       | Component     | Messaging     | Composer                                                         | Empty/length/link/pending/reset/error states                                                  | Mock action            | Interact                    | Correct one-submit UI                       | src/components/messaging/MessageComposer.test.tsx         | New                            |
| SL-T055 | P0       | Integration   | Realtime      | Lifecycle                                                        | Authorized event once; unrelated/duplicate ignored; unmount unsubscribes                      | Realtime client        | Subscribe/insert/replay     | No duplicate/leak                           | tests/integration/messaging/realtime.test.ts              | New                            |
| SL-T056 | P1       | Integration   | Realtime      | Reconnect                                                        | Missed messages backfill in order without duplicates                                          | Disconnect             | Insert/reconnect            | Complete thread                             | tests/integration/messaging/reconnect.test.ts             | New                            |
| SL-T057 | P1       | Database      | Messaging     | Retention                                                        | retention_at, holds and bounded purge behave correctly                                        | Message fixtures       | Run purge                   | Exact deletions                             | supabase/tests/retention/messages.test.sql                | New                            |
| SL-T058 | P1       | Integration   | Notifications | Creation                                                         | All event notifications use correct recipient/kind/text/href                                  | Mock email             | Trigger                     | One safe notification                       | tests/integration/notifications/service.test.ts           | New                            |
| SL-T059 | P1       | Integration   | Notifications | Preferences                                                      | Opt-outs suppress only intended email type                                                    | Preference matrix      | Trigger                     | Correct email/no-email                      | tests/integration/notifications/preferences.test.ts       | Confirm preference model       |
| SL-T060 | P1       | Integration   | Email         | Privacy/failure                                                  | No message/report body; missing key safe; failure policy                                      | Mock Resend            | Send                        | Safe payload/result                         | tests/integration/email/client.test.ts                    | New                            |
| SL-T061 | P1       | E2E           | Messaging     | Realtime chat                                                    | Two users exchange and see single realtime messages/read state                                | Connected contexts     | Send both ways              | Immediate persistent delivery               | e2e/messaging/realtime-chat.spec.ts                       | Expand J07                     |
| SL-T062 | P2       | Accessibility | Messaging     | Chat accessibility                                               | Keyboard, focus, log, announcements and dialogs                                               | Conversation           | Keyboard/axe                | No serious/critical violations              | e2e/a11y/messaging.spec.ts                                | New                            |
| SL-T063 | P0       | Integration   | Play          | Propose invite                                                   | Validate connection/shared game/platform/schedule/block/flag/read-only                        | Connected users        | Submit cases                | Only valid proposal                         | tests/integration/play/propose.test.ts                    | New                            |
| SL-T064 | P0       | Integration   | Play          | Proposal atomicity                                               | Bad slot or slot/notification failure leaves no orphan                                        | Inject failures        | Propose                     | Transaction/cleanup                         | tests/integration/play/propose-atomicity.test.ts          | Current risk                   |
| SL-T065 | P0       | Database      | Play          | Acceptance                                                       | Recipient only, valid state/time option, concurrent accept creates one session                | Invitation fixtures    | Accept/tamper               | One correct session                         | supabase/tests/rls/play_invitations.test.sql              | Expand                         |
| SL-T066 | P1       | Integration   | Play          | Decline/cancel                                                   | Correct actor/state; zero-row update fails                                                    | Invite matrix          | Invoke                      | Exact transition                            | tests/integration/play/transitions.test.ts                | New                            |
| SL-T067 | P0       | Integration   | Play          | Session state                                                    | Participants only; both confirmations complete; terminal states do not regress                | Sessions               | Mutate                      | Valid state machine                         | tests/integration/play/sessions.test.ts                   | New                            |
| SL-T068 | P1       | Unit          | Play          | Time/ICS                                                         | DST, invalid zone/date, escaping, injection, duration                                         | Fixed clock            | Convert/generate            | Valid safe ICS                              | src/domains/play/timezone.test.ts                         | Expand                         |
| SL-T069 | P1       | API           | Play          | Calendar                                                         | 401/404 for unauthorized; participant gets correct file                                       | Session fixture        | GET                         | Valid headers/event                         | tests/api/play-calendar.test.ts                           | New                            |
| SL-T070 | P1       | Integration   | Play          | Feedback                                                         | Completed participant only; private upsert; add_teammate once                                 | Sessions               | Submit choices              | Idempotent private result                   | tests/integration/play/feedback.test.ts                   | New                            |
| SL-T071 | P1       | Integration   | Play          | Reminders                                                        | 24h/30m send once; retry/canceled no duplicate                                                | Fake clock             | Run job                     | Correct timestamps/count                    | tests/integration/jobs/play-reminders.test.ts             | New                            |
| SL-T072 | P1       | E2E           | Play          | Full journey                                                     | Create, accept, view zones, confirm and save feedback                                         | Two contexts           | Complete flow               | Completed session/feedback                  | e2e/play/full-session.spec.ts                             | Replace shallow J08/J09        |
| SL-T073 | P2       | Component     | Play          | UI states                                                        | Pending/expired/blocked/canceled/completed/error/focus                                        | Mock actions           | Render/interact             | Correct controls                            | src/components/play/*.test.tsx                            | New                            |
| SL-T074 | P0       | Database      | Teammates     | Eligibility                                                      | Completed session, valid pair, no block, actor required                                       | Fixtures               | Call RPC                    | Ineligible rejected                         | supabase/tests/rls/teammate_relationships.test.sql        | Expand                         |
| SL-T075 | P1       | Integration   | Teammates     | Lifecycle                                                        | One intent proposed; mutual promotes once; end/promote authorized                             | Two users              | Submit transitions          | Unique correct state                        | tests/integration/teammates/lifecycle.test.ts             | New                            |
| SL-T076 | P0       | Security      | Teammates     | Private notes                                                    | Only author can read/edit notes                                                               | Users A/B/admin        | CRUD                        | Strict privacy                              | supabase/tests/rls/teammate_relationships.test.sql        | Expand                         |
| SL-T077 | P0       | Database      | Groups        | Creation                                                         | Enforce owner/name/size/limit/shared game and owner membership atomically                     | Free/Plus users        | Call RPC                    | Correct group or reject                     | supabase/tests/rls/private_groups.test.sql                | Expand                         |
| SL-T078 | P0       | Integration   | Groups        | Invite atomicity                                                 | Invite failures cannot silently create partial initial group                                  | Multiple invitees      | Inject failure              | Atomic or explicit partial result           | tests/integration/groups/create.test.ts                   | Confirm product rule           |
| SL-T079 | P0       | Database      | Groups        | Approval threshold                                               | Small unanimous; large majority; inactive users cannot vote                                   | Sizes 3-8              | Vote                        | Correct activation                          | supabase/tests/rls/group-approval.test.sql                | New                            |
| SL-T080 | P0       | Security      | Groups        | Ownership transfer                                               | Owner only to active member; roles/admin limits atomic                                        | Role matrix            | Transfer                    | Correct transition                          | supabase/tests/rls/group_ownership.test.sql               | Rewrite                        |
| SL-T081 | P0       | Security      | Group chat    | Active members read/send; pending/left/removed/nonmembers cannot | Membership matrix                                                                             | Query/send/subscribe   | Correct access              | supabase/tests/rls/group_messaging.test.sql | Expand                                                    |
| SL-T082 | P1       | Database      | Groups        | Open seats                                                       | Authorized roles, no spoofing, valid state lifecycle                                          | Group fixtures         | Mutate seats                | Correct state                               | supabase/tests/rls/group_open_seats.test.sql              | Expand                         |
| SL-T083 | P1       | Integration   | Groups        | Conversation idempotency                                         | Repeated creation returns one conversation/member set                                         | Active group           | Concurrent calls            | Single conversation                         | tests/integration/groups/conversation.test.ts             | New                            |
| SL-T084 | P1       | E2E           | Groups        | Full journey                                                     | Invite, approve, activate and group chat                                                      | Three contexts         | Complete flow               | Correct group/chat                          | e2e/groups/full-group.spec.ts                             | Expand J10                     |
| SL-T085 | P2       | Accessibility | Groups        | Mobile/keyboard                                                  | Creation, approval, chat, open seats accessible at 320px                                      | Group fixtures         | Mobile/keyboard             | No overflow/trap                            | e2e/a11y/groups.spec.ts                                   | New                            |
| SL-T086 | P0       | Integration   | Safety        | Report creation                                                  | Report atomically creates case, severity and authorized evidence once                         | Context fixtures       | Submit                      | Linked case/evidence                        | tests/integration/moderation/report.test.ts               | Current risk                   |
| SL-T087 | P0       | Security      | Safety        | Context authorization                                            | Cannot attach unrelated conversation/group/invite or extract messages                         | Users A/B/C            | Tamper IDs                  | Reject/no leakage                           | supabase/tests/security/report-context.test.sql           | New                            |
| SL-T088 | P0       | Security      | Safety        | Block/report order                                               | Reporting before/after block follows confirmed rule                                           | Blocked pair           | Submit both orders          | Approved behavior                           | tests/integration/moderation/block-report.test.ts         | Current policy blocks          |
| SL-T089 | P1       | Unit          | Safety        | Severity/schema                                                  | All categories, limits, false positives and normalization                                     | Inputs                 | Parse/classify              | Stable severity                             | src/domains/moderation/schemas.test.ts                    | Expand                         |
| SL-T090 | P0       | Security      | Admin         | MFA/scope                                                        | Every route/action requires membership, scope and current AAL2                                | Admin matrix           | Access/actions              | Correct deny/success                        | tests/integration/admin/authorization.test.ts             | New                            |
| SL-T091 | P0       | Database      | Admin         | Case actions                                                     | Validate case/subject/reviewer/reason/state and account restriction                           | Cases                  | Apply RPC                   | Atomic correct state                        | supabase/tests/admin/case-actions.test.sql                | New                            |
| SL-T092 | P0       | Security      | Admin         | Evidence audit                                                   | Every authorized evidence read creates immutable audit; unauthorized creates none             | Admin/nonadmin         | View                        | Evidence plus one audit                     | tests/integration/admin/evidence.test.ts                  | New                            |
| SL-T093 | P1       | Integration   | Admin         | Appeals                                                          | Subject only, one per action, valid decisions and restoration                                 | Action fixture         | Submit/resolve              | Correct state/audit                         | tests/integration/admin/appeals.test.ts                   | Expand                         |
| SL-T094 | P1       | Database      | Admin         | Release                                                          | Eligible case only; unrelated records unaffected; audit exists                                | Cases                  | Release                     | Correct result                              | supabase/tests/rls/moderation_release.test.sql            | Expand                         |
| SL-T095 | P1       | Security      | Admin         | Feature controls                                                 | Break-glass AAL2 only; every flag/cap change audited                                          | Scope matrix           | Toggle/set                  | Correct change/audit                        | tests/integration/admin/feature-controls.test.ts          | New                            |
| SL-T096 | P1       | Security      | Admin         | Catalog                                                          | Catalog scope only; validation and audit                                                      | Admin scopes           | Edit                        | Correct catalog state                       | tests/integration/admin/catalog.test.ts                   | Expand                         |
| SL-T097 | P0       | Security      | Privacy       | Data export                                                      | Own approved data only; exclude secrets/private notes/evidence/others                         | Rich user              | Export                      | Complete safe export                        | supabase/tests/privacy/export.test.sql                    | New                            |
| SL-T098 | P0       | Database      | Privacy       | Audit immutability                                               | Users/admins cannot update/delete/spoof audit events                                          | Role matrix            | CRUD                        | Append-only enforcement                     | supabase/tests/rls/audit_events.test.sql                  | Expand                         |
| SL-T099 | P1       | E2E           | Safety/Admin  | Full case                                                        | Report, AAL2 claim/evidence/action, outcome and appeal                                        | User/admin contexts    | Complete flow               | Correct case/audit/appeal                   | e2e/moderation/full-case.spec.ts                          | New                            |
| SL-T100 | P0       | API           | Billing       | Signature                                                        | Missing/malformed/wrong/valid Stripe signatures                                               | Signed fixtures        | POST raw body               | Invalid no processing; valid accepted       | tests/api/stripe-webhook.test.ts                          | Expand                         |
| SL-T101 | P0       | Integration   | Billing       | Webhook lifecycle                                                | Checkout/create/update/delete/failure/recovery derive correct entitlement                     | Event fixtures         | Process sequence            | Correct tier/limits/read-only               | tests/integration/billing/webhooks.test.ts                | New                            |
| SL-T102 | P0       | Integration   | Billing       | Idempotency/order                                                | Duplicate/out-of-order events cannot regress state or repeat effects                          | Event sequence         | Replay/reorder              | Stable latest state                         | tests/integration/billing/webhook-order.test.ts           | New                            |
| SL-T103 | P0       | Integration   | Billing       | Resubscribe                                                      | Read-only canceled user can checkout and regain writable Plus                                 | Canceled user          | Checkout/webhook            | Successful recovery                         | tests/integration/billing/resubscribe.test.ts             | Likely defect                  |
| SL-T104 | P0       | Integration   | Billing       | Checkout/portal auth                                             | Password/user/plan/flag/customer/URL/status checks                                            | Account matrix         | Create sessions             | Correct requests/errors                     | tests/integration/billing/actions.test.ts                 | New                            |
| SL-T105 | P1       | Database      | Billing       | Saved searches                                                   | Plus only, max 10, unique name, ownership, valid filters                                      | Free/Plus              | CRUD                        | Correct rejection/visibility                | supabase/tests/rls/saved_searches.test.sql                | Expand                         |
| SL-T106 | P1       | Integration   | Billing       | Limits                                                           | Free/Plus limits transition and downgrade preserves data per rule                             | Tier changes           | Recompute/mutate            | Approved behavior                           | tests/integration/billing/entitlements.test.ts            | Confirm excess-data rule       |
| SL-T107 | P0       | Integration   | Billing       | Deletion billing                                                 | Deletion cannot finalize with active Stripe subscription absent retry/escalation              | Cancel failure         | Confirm/process             | No silent charge                            | tests/integration/billing/deletion.test.ts                | New                            |
| SL-T108 | P1       | E2E           | Billing       | Full lifecycle                                                   | Upgrade, Plus limits, portal, lapse, reads and resubscribe                                    | Stripe test/mocks      | Complete UI                 | Full lifecycle                              | e2e/billing/lifecycle.spec.ts                             | Replace shallow tests          |
| SL-T109 | P0       | Database      | Security      | Universal RLS                                                    | Dynamically assert RLS on every public exposed table and expected grants                      | Full schema            | Inspect catalogs            | All protected/allowlisted                   | supabase/tests/security/all-tables-rls.test.sql           | Replace six-table test         |
| SL-T110 | P0       | API           | Cron          | Authorization                                                    | Missing/wrong bearer rejected even if secret absent in production                             | Mock jobs/env          | GET cron routes             | 401; job not called                         | tests/api/cron-auth.test.ts                               | Current public-if-missing risk |
| SL-T111 | P1       | Integration   | Jobs          | Idempotency/failure                                              | Same-hour duplicate skips; errors fail; retry/concurrency once                                | Fake clock             | Run jobs                    | One execution/accurate metadata             | tests/integration/jobs/idempotency.test.ts                | New                            |
| SL-T112 | P1       | API           | Health        | Semantics                                                        | Healthy/degraded/unavailable return agreed status/body/time                                   | Mock Supabase          | GET                         | Exact health contract                       | tests/api/health.test.ts                                  | Degraded currently 200         |
| SL-T113 | P1       | Smoke         | Deploy        | Smoke                                                            | Fail on degraded DB, broken protected routing, wrong registration state                       | Staging                | Run script                  | Nonzero unhealthy release                   | scripts/smoke-post-deploy.test.ts                         | Current smoke accepts degraded |
| SL-T114 | P0       | Security      | Observability | Sentry scrub                                                     | Redact sensitive nested values, URLs and error text                                           | Sensitive contexts     | Capture                     | No sensitive SDK/log data                   | src/lib/sentry.test.ts                                    | Current shallow key-only       |
| SL-T115 | P0       | Security      | Analytics     | Allowlist                                                        | Reject/scrub unknown/sensitive properties; replay never starts                                | Mock PostHog           | Track/init                  | Minimal approved data only                  | src/lib/analytics/events.test.ts                          | Property allowlist absent      |
| SL-T116 | P1       | Accessibility | App           | Automated WCAG                                                   | Public/auth/app/admin/dialog/error/mobile states have no serious/critical axe violations      | Fixtures               | Navigate/analyze            | Zero serious/critical                       | e2e/a11y/*.spec.ts                                        | Expand                         |
| SL-T117 | P1       | Accessibility | App           | Keyboard/focus                                                   | Critical workflows keyboard-only with correct focus restoration                               | Fixtures               | Keyboard flow               | No traps/lost focus                         | e2e/a11y/keyboard.spec.ts                                 | New                            |
| SL-T118 | P1       | E2E           | Responsive    | Mobile/reflow                                                    | Core journeys usable at 320px, Pixel 7, 200% zoom, landscape                                  | Fixtures               | Run viewports               | No hidden controls/overflow                 | e2e/responsive/core.spec.ts                               | New                            |
| SL-T119 | P1       | Security      | Config        | Production env                                                   | Startup fails without required service/cron/Stripe/vendor config for enabled features         | Env matrix             | Import/build                | Clear fail-fast errors                      | src/lib/env.test.ts                                       | Expand                         |
| SL-T120 | P2       | Performance   | Messaging     | Realtime load                                                    | 100 authenticated subscriptions meet latency/error/no-duplicate targets                       | Staging users          | Run k6                      | Thresholds met                              | scripts/load/messaging-realtime.k6.ts                     | Current script not realtime    |

## 6. Functional Area Test Details

| Area                       | Intended behavior                                                              | Test IDs        | Primary risk if untested                                          | Implementation order                           |
| -------------------------- | ------------------------------------------------------------------------------ | --------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| Authentication/accounts    | Controlled registration, safe sessions, mandatory attestation, secure deletion | SL-T001–SL-T015 | Unauthorized access, invalid consent, incomplete deletion/billing | Provisioning/RLS, routing, actions, E2E        |
| Profile/onboarding/catalog | Complete privacy-controlled profiles and valid catalog data                    | SL-T016–SL-T027 | Incomplete profiles, data leakage, invalid game data              | Ownership/integrity, completion, actions, E2E  |
| Discovery                  | Hard exclusions, density gate, compatible transparent results                  | SL-T028–SL-T038 | Block/private leakage, bad matches, stale results                 | Eligibility/security, cohort/lifecycle, UI     |
| Connections/blocking       | Authorized bounded mutual relationships and overriding blocks                  | SL-T039–SL-T048 | Unauthorized acceptance, duplicate pairs, incomplete block        | RPC/block security, actions, E2E               |
| Messaging/notifications    | Authorized realtime messaging with safe delivery and retention                 | SL-T049–SL-T062 | Message leakage, duplicates, PII emails, stale subscriptions      | RLS/actions/atomicity/realtime, then UI        |
| Play                       | Valid invitations, sessions, time zones, private feedback                      | SL-T063–SL-T073 | Orphans, wrong-user acceptance, bad session state                 | Atomicity/RPC/state, then reminders/E2E        |
| Teammates/groups           | Consent-based relationships and private group membership/chat                  | SL-T074–SL-T085 | Ownership theft, private-note leak, unauthorized chat             | Eligibility/ownership/membership, then E2E     |
| Safety/admin/privacy       | Complete cases, AAL2/scopes, audit, appeal/export                              | SL-T086–SL-T099 | Lost reports, evidence leak, unaudited admin access               | Report/security/MFA/audit, then workflows      |
| Billing                    | Signed idempotent Stripe lifecycle and recoverable lapse                       | SL-T100–SL-T108 | Wrong entitlements, forged events, inability to resubscribe       | Signature/lifecycle/order/resubscribe/deletion |
| Platform/operations        | Universal RLS, secured cron, truthful health, safe telemetry, accessibility    | SL-T109–SL-T120 | Public jobs/tables, PII, false release health                     | RLS/cron/telemetry/env, then a11y/load         |

## 7. P0 Critical Test Plan

All P0 tests below should block merges.

| Test IDs                                             | Functionality protected                                                 | Required setup                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| SL-T001–SL-T003, SL-T005–SL-T007, SL-T010–SL-T015    | Authentication, registration, sessions, consent, deletion               | Status users, auth callback fixtures, Stripe subscription |
| SL-T016, SL-T017, SL-T019, SL-T022, SL-T023, SL-T025 | Onboarding/profile integrity and privacy                                | Profile prerequisite and viewer matrices                  |
| SL-T028, SL-T030                                     | Discovery hard exclusions and data privacy                              | Mixed eligible/private/blocked candidates                 |
| SL-T039, SL-T040, SL-T042, SL-T047                   | Connection authorization and block propagation                          | Request race and relationship fixtures                    |
| SL-T049–SL-T051, SL-T053, SL-T055                    | Messaging membership, action boundaries, atomicity, realtime            | Direct/group conversations and failure injection          |
| SL-T063–SL-T065, SL-T067                             | Invitation/session authorization and atomicity                          | Connected pair, time options, concurrent acceptance       |
| SL-T074, SL-T076–SL-T081                             | Teammate/group consent, ownership, membership/chat privacy              | Completed sessions and role matrices                      |
| SL-T086–SL-T088, SL-T090–SL-T092, SL-T097, SL-T098   | Reporting, evidence, MFA/scopes, export and audit                       | User/admin/case fixtures                                  |
| SL-T100–SL-T104, SL-T107                             | Stripe signature, lifecycle, ordering, resubscription, deletion billing | Signed Stripe event fixtures                              |
| SL-T109, SL-T110, SL-T114, SL-T115                   | Universal database protection, cron authentication, telemetry privacy   | Full schema and sensitive payload fixtures                |

## 8. Gaps, Ambiguities, and Product Questions

| Area          | File(s)                            | Ambiguity                                            | Why It Matters                      | Product Question                        |
| ------------- | ---------------------------------- | ---------------------------------------------------- | ----------------------------------- | --------------------------------------- |
| Registration  | supabase/config.toml, auth actions | Confirmation disabled but check-email flow exists    | Changes signup journey              | Require verified email in production?   |
| Rate limiting | src/lib/rate-limit.ts              | In-memory limiter is instance-local                  | Unreliable serverless protection    | Which durable limiter is required?      |
| Availability  | Profile schema/migration           | Overlap rule undefined                               | Matching can be contradictory       | Merge, allow, or reject overlaps?       |
| Discovery     | Discovery modules                  | No explicit expiry job found                         | Stale discoverability               | Query-time or background expiry?        |
| Visibility    | Disclosure/query code              | Definitive field matrix not centralized              | Privacy tests need authority        | Exact field visibility by relationship? |
| Block/report  | Moderation policies                | Blocked pair cannot report                           | Blocking may suppress safety report | Allow reporting after block?            |
| Messaging     | sendMessage                        | Message persists before notification/email           | Retry duplicates                    | Use outbox/nonfatal side effects?       |
| Links         | Messaging action                   | Per-message confirm may override global flag         | Flag meaning unclear                | Can user confirmation override flag?    |
| Notifications | notification service               | Event types reuse email_new_message                  | Opt-outs too broad                  | Separate preference per event?          |
| Play          | proposePlayInvitation              | Invitation inserted before time options              | Orphan records                      | One transaction required?               |
| Groups        | createPrivateGroup                 | Invite failures ignored                              | Partial group success               | Atomic initial invites?                 |
| Group blocks  | Group policies                     | Existing co-member block behavior unclear            | Privacy/access conflict             | Guided resolution details?              |
| Moderation    | submitReport                       | Report insert precedes case RPC                      | Unprocessed report                  | Trigger/outbox guarantee?               |
| Moderation    | Severity classifier                | Keyword false positives                              | SLA/restrictions                    | Advisory or authoritative severity?     |
| Admin MFA     | Supabase config/admin actions      | TOTP disabled locally                                | Cannot test successful AAL2         | CI AAL2 strategy?                       |
| Deletion      | confirmAccountDeletion             | Stripe failure ignored                               | Continued charges                   | Must deletion stop/retry?               |
| Billing       | checkout/entitlements              | Canceled read-only user may be blocked from checkout | Cannot resubscribe                  | Exempt checkout from read-only?         |
| Billing       | Entitlement downgrade              | Excess records not addressed                         | Data access ambiguity               | Retain, hide, or delete excess?         |
| Billing       | Stripe mapping                     | Trialing/incomplete/unpaid/paused unspecified        | Wrong entitlement                   | Exact state mapping?                    |
| Health        | api/health                         | Degraded DB returns 200                              | Broken deploy can pass smoke        | Should degraded be 503?                 |
| Cron          | Cron routes/env                    | Missing secret opens routes                          | Privileged public jobs              | Fail production startup without secret? |
| Accessibility | axe suite                          | Only critical violations fail                        | Serious failures merge              | Block serious plus critical?            |
| Storage       | Supabase config                    | Storage enabled but unused                           | Unused attack surface               | Disable until uploads exist?            |

Each row is marked NEEDS PRODUCT CONFIRMATION.

## 9. Suggested Test File Structure

    e2e/
      a11y/
      auth/
      billing/
      connections/
      fixtures/
      groups/
      messaging/
      moderation/
      play/
      responsive/
      smoke/
    src/
      components/**/*.test.tsx
      domains/**/*.test.ts
      lib/**/*.test.ts
    tests/
      api/
      integration/
        accounts/
        admin/
        auth/
        billing/
        connections/
        discovery/
        email/
        groups/
        jobs/
        messaging/
        moderation/
        notifications/
        play/
        profile/
        teammates/
      security/
      support/
    supabase/tests/
      admin/
      auth/
      privacy/
      retention/
      rls/
      security/
    scripts/
      load/
      smoke-post-deploy.ts

## 10. Test Data and Fixtures Plan

Required users:

| Fixture                                       | Purpose                           |
| --------------------------------------------- | --------------------------------- |
| anonymous                                     | Public/protected routing          |
| onboarding_attestation                        | Attestation gate                  |
| onboarding_profile                            | Progressive onboarding            |
| active_free_a/b/c                             | Primary, peer, nonmember/attacker |
| active_plus                                   | Plus entitlements                 |
| past_due_grace                                | Seven-day grace                   |
| past_due_readonly                             | Post-grace lapse                  |
| canceled_readonly                             | Resubscription                    |
| restricted/suspended/deletion_pending/deleted | Account guards                    |
| safety_admin_aal1/aal2                        | MFA denial/success                |
| catalog_admin_aal2                            | Catalog scope                     |
| break_glass_admin_aal2                        | Feature controls                  |
| support_admin_aal2                            | Scope separation                  |

Required scenario records:

- Complete/incomplete profiles and all disclosure levels
- Compatible/incompatible game-platform combinations
- Cohorts with 39 and 40 qualified users
- Active, paused, and expired intents
- Every connection request and relationship state
- Direct/group conversations with active and removed members
- Messages inside/outside retention and legal holds
- Every play invitation/session/feedback state
- Every teammate/group membership state
- Reports, cases, evidence, actions, appeals and audits
- Free, Plus, grace, canceled and webhook-pending subscriptions
- Feature flags in enabled and disabled states

External mocks:

- Stripe: signed events, checkout/portal, retrieve/cancel failures, ordering
- Resend: capture payload and simulate timeout/failure
- PostHog: capture initialization/events/properties
- Sentry: capture scrubbed payload
- Clock: deterministic expiry, grace, reminder and retention times
- Realtime: local Supabase preferred; mock only hook unit boundaries

Isolation:

- Unique user and data namespace per worker/project
- Transaction rollback for integration tests where practical
- BEGIN/ROLLBACK for pgTAP
- Scenario-owned cleanup instead of broad destructive cleanup
- Feature flags reset in afterEach, including failed tests
- Deterministic timestamps and explicit time zones
- No shared group/invite/message/subscription between desktop/mobile projects

## 11. CI/CD Recommendations

Every pull request, merge-blocking:

1. Prettier on changed files
2. ESLint
3. TypeScript
4. Vitest unit coverage
5. Component tests
6. Supabase reset and migrations
7. Full pgTAP RLS/security suite
8. P0 server/API integration tests
9. Desktop Chromium critical E2E
10. axe serious/critical checks
11. Production build

Main branch adds:

- Desktop and mobile Playwright
- Full integration suite
- Staging smoke
- Migration drift
- Stripe test lifecycle
- Failure artifacts

Nightly/manual:

- Full browser matrix
- OWASP ZAP baseline
- 100-subscription realtime load
- Large-batch retention/deletion
- Out-of-order Stripe suite
- Backup/restore rehearsal
- Manual NVDA/VoiceOver

CI corrections:

- Isolate Playwright users by project and worker.
- Ensure test:e2e and test:a11y do not execute the same specs twice.
- Fail serious and critical axe violations.
- Pin Supabase CLI instead of latest.
- Archive database logs, traces, screenshots and coverage.
- Validate server readiness before Playwright.
- Make cron and production-secret validation deployment gates.

## 12. Final Prioritized Implementation Roadmap

### Phase 1 — Critical safety net

Goal: protect authentication, authorization, privacy, data integrity, safety, billing and deletion.

Scope:

- All P0 tests from Section 7
- Complete database authorization matrix
- Server-action integration harness
- Stripe/AAL2/failure-injection fixtures
- Decisions on block/report, deletion billing, resubscription and transactional mutations

Complexity: High.

Expected improvement: merge-blocking protection for the highest-risk security and production failures.

### Phase 2 — Core functionality coverage

Goal: prove every principal user workflow and business transition.

Scope:

- Remaining P1 tests
- Full onboarding, discovery, connection, messaging, play, group, moderation and billing E2E
- Notification/email coverage
- Scheduled jobs and retention
- Component states for primary forms

Complexity: High.

Expected improvement: every core feature covered at its owning layer plus one end-to-end journey.

### Phase 3 — Edge cases, accessibility and regression hardening

Goal: reduce flakiness and establish cross-device release confidence.

Scope:

- P2 component/accessibility/performance tests
- Browser and responsive matrix
- Realtime load
- OWASP ZAP
- Manual accessibility evidence
- Regression test for every production defect

Complexity: Medium to High.

Expected improvement: stable release gates for accessibility, mobile behavior, operations and performance.
