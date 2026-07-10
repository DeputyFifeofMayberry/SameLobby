# Canonical test anchors

> Planning stubs — flesh out during implementation.

## SL-T001

<a id="sl-t001"></a>

<a id="sl-t001-setup"></a>

### Setup

Playwright chromium-p0 project; unauthenticated browser context and SEED_USERS.active fixture.


<a id="sl-t001-steps"></a>

### Steps

1. Visit `/discover`, `/messages`, and `/profile` without session.
2. Sign in active seed user via password API (D14).
3. Visit `/discover`.


<a id="sl-t001-expected"></a>

### Expected

Unauthenticated visits redirect to `/sign-in?next=…`; authenticated active user reaches `/discover` with heading visible.


## SL-T002

<a id="sl-t002"></a>

<a id="sl-t002-setup"></a>

### Setup

Vitest unit project; account and profile fixture objects.


<a id="sl-t002-steps"></a>

### Steps

Exercise `getAccountRouteRedirect` and `resolvePostAuthRedirect` across onboarding, active, incomplete, deletion_pending, suspended/restricted/deleted, attestation, and billing self-service paths.


<a id="sl-t002-expected"></a>

### Expected

Route guard returns safe destinations per account status and profile completeness; unsafe `next` paths rejected.


## SL-T003

<a id="sl-t003"></a>

<a id="sl-t003-setup"></a>

### Setup

Local Supabase; `registration_open` feature flag toggled; anon auth client for sign-up.


<a id="sl-t003-steps"></a>

### Steps

1. Sign up with registration open.
2. Sign up with registration closed.
3. pgTAP: set `registration_cap` at boundary and insert auth users.


<a id="sl-t003-expected"></a>

### Expected

Open sign-up provisions onboarding account at identity step; closed sign-up returns error with no account row; cap SQL rejects overflow insert.


## SL-T004

<a id="sl-t004"></a>

<a id="sl-t004-setup"></a>

### Setup

Vitest unit and integration projects; fake timers for in-memory `checkRateLimit`.


<a id="sl-t004-steps"></a>

### Steps

1. Unit: allow under limit, deny at limit with retryAfterMs, reset after window, isolate per key.
2. Integration: enforce sign-in limits per email key; sign-up key resets after auth window.


<a id="sl-t004-expected"></a>

### Expected

Limiter allows then denies at cap with retryAfterMs; window reset clears counter; keys isolated; auth-style keys enforce per-email limits.


## SL-T005

<a id="sl-t005"></a>

<a id="sl-t005-setup"></a>

### Setup

Postgres role via `tests.as_postgres()`. No pre-existing auth user for fixture UUID `f1111111-1111-1111-1111-111111111111`.


<a id="sl-t005-steps"></a>

### Steps

1. Assert no `accounts` row for the UUID.
2. Insert `auth.users` row with email `provision-new@test.local`.
3. Query provisioned `accounts`, `gamer_profiles`, `disclosure_settings`, and `entitlements` rows.


<a id="sl-t005-expected"></a>

### Expected

Account row created by `handle_new_user` in `onboarding` status with matching email; `gamer_profiles` row from `handle_new_account_profile`; three default `disclosure_settings`; `entitlements` tier `free`.


## SL-T006

<a id="sl-t006"></a>

<a id="sl-t006-setup"></a>

### Setup

Provisioned active user; anon and actor Supabase clients.


<a id="sl-t006-steps"></a>

### Steps

1. Password API sign-in with valid credentials.
2. Attempt wrong password and missing email.
3. Anonymous actor queries accounts.


<a id="sl-t006-expected"></a>

### Expected

Valid sign-in returns session and RLS read of own account; invalid credentials throw without exposing rows.


## SL-T007

<a id="sl-t007"></a>

<a id="sl-t007-setup"></a>

### Setup

Vitest api project with mocked Supabase server client and account/profile queries.


<a id="sl-t007-steps"></a>

### Steps

Hit `GET /auth/callback` for bad code, recovery type, successful sign-in with safe `next`, unsafe external `next`, and onboarding user.


<a id="sl-t007-expected"></a>

### Expected

Bad code → sign-in error; recovery → reset-password; safe next honored; external next → `/discover`; onboarding → attestation.


## SL-T008

<a id="sl-t008"></a>

<a id="sl-t008-setup"></a>

### Setup

Local Supabase; anon auth client; provisioned active user or unknown email.


<a id="sl-t008-steps"></a>

### Steps

1. Call `resetPasswordForEmail` for provisioned user.
2. Call `resetPasswordForEmail` for unknown email.


<a id="sl-t008-expected"></a>

### Expected

Both paths return generic success with no error (Q01); unknown email does not leak account state.


## SL-T009

<a id="sl-t009"></a>

<a id="sl-t009-setup"></a>

### Setup

React Testing Library; mocked Supabase `updateUser` and Next router.


<a id="sl-t009-steps"></a>

### Steps

1. Submit mismatched passwords.
2. Submit weak password.
3. Submit valid password and wait for pending state.
4. Submit valid password with update error.


<a id="sl-t009-expected"></a>

### Expected

Mismatch and weak-password validation shown before Supabase call; pending state disables inputs then redirects to `/sign-in`; update errors surfaced in alert without redirect.


## SL-T010

<a id="sl-t010"></a>

<a id="sl-t010-setup"></a>

### Setup

Playwright with password API auth (D14); active seed user.


<a id="sl-t010-steps"></a>

### Steps

1. Sign in and visit `/discover`.
2. Clear cookies.
3. Visit `/messages`.


<a id="sl-t010-expected"></a>

### Expected

Cleared cookies require sign-in again with `next` param preserved.


## SL-T011

<a id="sl-t011"></a>

<a id="sl-t011-setup"></a>

### Setup

Provisioned onboarding user; service-role admin client.


<a id="sl-t011-steps"></a>

### Steps

1. Call `complete_account_attestation` RPC.
2. Sign in actor and read account.
3. Count `consent_events`.


<a id="sl-t011-expected"></a>

### Expected

Account becomes `active` with attestation timestamps; actor reads own row; four consent events recorded.


## SL-T012

<a id="sl-t012"></a>

<a id="sl-t012-setup"></a>

### Setup

Postgres inserts auth user `f2222222-2222-2222-2222-222222222222` with provisioned onboarding account.


<a id="sl-t012-steps"></a>

### Steps

1. Call `complete_account_attestation` as service role.
2. Set authenticated JWT for the user.
3. Attempt direct `accounts.status` update.


<a id="sl-t012-expected"></a>

### Expected

Account becomes `active`; four `consent_events` recorded; authenticated user cannot mutate protected status (`42501`).


## SL-T013

<a id="sl-t013"></a>

<a id="sl-t013-setup"></a>

### Setup

Provisioned active user.


<a id="sl-t013-steps"></a>

### Steps

1. Call `request_account_deletion` RPC.
2. Actor reads account status.
3. Repeat RPC; count deletion_requests rows.


<a id="sl-t013-expected"></a>

### Expected

Account `deletion_pending`; request status `requested`; second call is idempotent (single request row).


## SL-T014

<a id="sl-t014"></a>

<a id="sl-t014-setup"></a>

### Setup

Active user with deletion request; password re-auth fixture.


<a id="sl-t014-steps"></a>

### Steps

Invoke deletion confirmation server action with correct password after `request_account_deletion`.


<a id="sl-t014-expected"></a>

### Expected

Deletion request confirmed per Q16; account remains `deletion_pending` until pipeline runs (D2 characterized).


## SL-T015

<a id="sl-t015"></a>

<a id="sl-t015-setup"></a>

### Setup

Two active accounts: one with confirmed `deletion_requests`, one with active `legal_holds`.


<a id="sl-t015-steps"></a>

### Steps

1. Run `process_deletion_stage(5)` for deletable account.
2. Assert held account remains `deletion_pending` after pipeline.
3. Re-run `process_deletion_stage(5)` after deletion completes.


<a id="sl-t015-expected"></a>

### Expected

Deletable account becomes `deleted`; legal hold blocks finalization; second pipeline pass returns 0 (idempotent).


## SL-T016

<a id="sl-t016"></a>

<a id="sl-t016-setup"></a>

### Setup

Active user with incomplete profile defaults.


<a id="sl-t016-steps"></a>

### Steps

Load account/profile and call `getAccountRouteRedirect` for `/discover`; run completeness helpers.


<a id="sl-t016-expected"></a>

### Expected

Incomplete profile redirects to `/onboarding/identity`; completeness helpers report errors.


## SL-T017

<a id="sl-t017"></a>

<a id="sl-t017-setup"></a>

### Setup

Two active users for duplicate-name scenario; actor sessions via password API.


<a id="sl-t017-steps"></a>

### Steps

1. Save display name + time zone via actor updates.
2. Attempt taken display name.
3. Simulate split profile/account writes (D11).


<a id="sl-t017-expected"></a>

### Expected

Happy path persists both fields; duplicate name fails without adopting name; split-write path remains recoverable when account update follows profile save.


## SL-T018

<a id="sl-t018"></a>

<a id="sl-t018-setup"></a>

### Setup

Vitest unit project; profile schema and completeness fixture objects.


<a id="sl-t018-steps"></a>

### Steps

Exercise `displayNameSchema`, `communicationStepSchema`, `isProfileComplete`, `profileCompletenessErrors`, and `MAX_ACTIVE_USER_GAMES`.


<a id="sl-t018-expected"></a>

### Expected

Valid names pass; short names fail; at least one communication mode required; complete profile passes; missing games yields specific error; game cap matches free tier.


## SL-T019

<a id="sl-t019"></a>

<a id="sl-t019-setup"></a>

### Setup

Two active accounts with catalog `games`/`platforms` seeded.


<a id="sl-t019-steps"></a>

### Steps

1. Owner upserts and reads own `user_games`.
2. Outsider attempts read, delete, and update on owner's rows.


<a id="sl-t019-expected"></a>

### Expected

Owner CRUD succeeds; outsider sees zero rows and cannot mutate another account's `user_games`.


## SL-T020

<a id="sl-t020"></a>

<a id="sl-t020-setup"></a>

### Setup

Provisioned active user; password API sign-in; actor Supabase client.


<a id="sl-t020-steps"></a>

### Steps

1. Insert `current_intents` row via actor.
2. Update goal and expiry on existing intent.
3. Read intent back.


<a id="sl-t020-expected"></a>

### Expected

Actor upserts current intent; updated goal and status persist for own account.


## SL-T021

<a id="sl-t021"></a>

<a id="sl-t021-setup"></a>

### Setup

pgTAP; two active auth users with availability_windows RLS.


<a id="sl-t021-steps"></a>

### Steps

1. Owner inserts availability window.
2. Owner reads own windows.
3. Outsider reads owner windows.
4. Owner updates and deletes own window.


<a id="sl-t021-expected"></a>

### Expected

Owner can insert, read, update, and delete own availability; outsider sees zero rows.


## SL-T022

<a id="sl-t022"></a>

<a id="sl-t022-setup"></a>

### Setup

Profile completeness fixture objects (no DB).


<a id="sl-t022-steps"></a>

### Steps

Call `isProfileComplete` and `profileCompletenessErrors` with missing fields, shortcut via `onboarding_completed_at`, and all-minimum pass.


<a id="sl-t022-expected"></a>

### Expected

Incomplete profiles fail with specific errors; completed shortcut passes; full minimum field set passes.


## SL-T023

<a id="sl-t023"></a>

<a id="sl-t023-setup"></a>

### Setup

Owner and outsider active accounts with default disclosure settings.


<a id="sl-t023-steps"></a>

### Steps

1. Assert three default disclosure rows.
2. Owner reads own settings.
3. Outsider reads owner settings and gamer_profiles.


<a id="sl-t023-expected"></a>

### Expected

Defaults match migration matrix; owner reads three rows; outsider sees zero disclosure and profile rows (Package E / Q06).


## SL-T024

<a id="sl-t024"></a>

<a id="sl-t024-setup"></a>

### Setup

Owner and outsider active users; Fortnite catalog IDs; actor clients.


<a id="sl-t024-steps"></a>

### Steps

1. Owner upserts `user_games` via actor.
2. Owner reads own games.
3. Outsider reads owner games.


<a id="sl-t024-expected"></a>

### Expected

Owner persists active game/platform row; outsider cannot read another account's games.


## SL-T025

<a id="sl-t025"></a>

<a id="sl-t025-setup"></a>

### Setup

Owner account with `gamer_profiles` and `disclosure_settings`; outsider and anon roles available.


<a id="sl-t025-steps"></a>

### Steps

1. Owner reads own profile tables.
2. Outsider reads and updates owner's profile data.
3. Anon reads public `games` catalog.


<a id="sl-t025-expected"></a>

### Expected

Owner reads succeed; outsider denied cross-account reads/writes; anon can read public catalog.


## SL-T026

<a id="sl-t026"></a>

<a id="sl-t026-setup"></a>

### Setup

Local Supabase with seeded catalog migrations.


<a id="sl-t026-steps"></a>

### Steps

pgTAP: count active games, anchor games, anchor slugs, platform coverage, crossplay sets, and slug uniqueness.


<a id="sl-t026-expected"></a>

### Expected

150 active games; 8 anchor games with expected slugs; every active game has a platform; crossplay sets exist; slugs unique.


## SL-T027

<a id="sl-t027"></a>

<a id="sl-t027-setup"></a>

### Setup

Playwright chromium; SEED_USERS.onboarding and active fixtures; `signInThroughUi` for D14 onboarding path.


<a id="sl-t027-steps"></a>

### Steps

1. Sign in onboarding user through UI; assert attestation form with required legal checkboxes.
2. Active fixture visits `/discover` and `/profile` with completed minimum profile.


<a id="sl-t027-expected"></a>

### Expected

Onboarding user lands on attestation with required fields; active user sees discover heading and profile game/communication details.


## SL-T028

<a id="sl-t028"></a>

<a id="sl-t028-setup"></a>

### Setup

Synthetic `DiscoveryCandidate` fixtures.


<a id="sl-t028-steps"></a>

### Steps

Run `checkEligibility`, `canPlayOnSharedGame`, and `buildReasonCodes` for self, blocked, no-shared-game, crossplay, and stable reason ordering.


<a id="sl-t028-expected"></a>

### Expected

Self and blocked rejected; shared game + goal required; crossplay accepted; reason codes stable and include shared signals.


## SL-T029

<a id="sl-t029"></a>

<a id="sl-t029-setup"></a>

### Setup

Vitest unit project; discovery cohort helper fixtures.


<a id="sl-t029-steps"></a>

### Steps

Exercise `timeZoneRegion`, `buildCohortKey`, `cohortStatusFromCount`, `pickAnchorGameSlug`, and `COHORT_MIN_QUALIFIED`.


<a id="sl-t029-expected"></a>

### Expected

Time zones map to regions; cohort keys deterministic; 39 without demand is below_threshold; 39 with demand is demand_collecting; 40+ is active_discovery; anchor slug preferred with fallback.


## SL-T030

<a id="sl-t030"></a>

<a id="sl-t030-setup"></a>

### Setup

Two discoverable users with fortnite/pc catalog; `discovery_enabled` flag true.


<a id="sl-t030-steps"></a>

### Steps

1. Admin query discoverable profiles by display name.
2. Insert block; run `checkEligibility` with blocked pair.


<a id="sl-t030-expected"></a>

### Expected

Target appears in discoverable query; blocked pair returns `{ eligible: false, reason: 'blocked' }`.


## SL-T031

<a id="sl-t031"></a>

<a id="sl-t031-setup"></a>

### Setup

Two discoverable users; `discovery_enabled` flag; shared locale, games, and intents.


<a id="sl-t031-steps"></a>

### Steps

1. Search discoverable profiles.
2. Call `refreshRecommendations`.
3. Read `discovery_recommendations` and `getActiveRecommendations`.


<a id="sl-t031-expected"></a>

### Expected

Target appears in discoverable search; refresh writes recommendation rows with reason codes; active cards include target.


## SL-T032

<a id="sl-t032"></a>

<a id="sl-t032-setup"></a>

### Setup

Synthetic `DiscoveryCandidate` fixtures and crossplay map.


<a id="sl-t032-steps"></a>

### Steps

1. Rank candidates twice for stable ordering.
2. Rank 20 candidates.
3. Rank with blocked pair set.


<a id="sl-t032-expected"></a>

### Expected

Ranking stable; higher reason count wins with display-name tie-break; capped at MAX_RECOMMENDATIONS; blocked pairs excluded in either direction.


## SL-T033

<a id="sl-t033"></a>

<a id="sl-t033-setup"></a>

### Setup

Two discoverable users with games and intents; `discovery_enabled` flag on.


<a id="sl-t033-steps"></a>

### Steps

Call `getCohortSnapshot` for viewer account.


<a id="sl-t033-expected"></a>

### Expected

Snapshot returns cohort key, qualified count ≥ 2, and valid cohort status (below_threshold through active_discovery).


## SL-T034

<a id="sl-t034"></a>

<a id="sl-t034-setup"></a>

### Setup

pgTAP; viewer, target, and blocked active users; blocks and reason codes seeded.


<a id="sl-t034-steps"></a>

### Steps

1. Viewer queries target gamer_profile.
2. Insert block; viewer reads own blocks.
3. Count recommendation_reason_codes.


<a id="sl-t034-expected"></a>

### Expected

Gamer profiles remain own-only; blocker sees own block row; six reason codes seeded.


## SL-T035

<a id="sl-t035"></a>

<a id="sl-t035-setup"></a>

### Setup

Active user with completed profile; `discovery_enabled` flag on.


<a id="sl-t035-steps"></a>

### Steps

Actor updates `discovery_paused_at` on own gamer_profile.


<a id="sl-t035-expected"></a>

### Expected

Pause timestamp persisted on gamer_profiles.


## SL-T036

<a id="sl-t036"></a>

<a id="sl-t036-setup"></a>

### Setup

Viewer plus fortnite and halo discoverable users; `discovery_enabled` flag on.


<a id="sl-t036-steps"></a>

### Steps

Search discoverable profiles filtered by fortnite/pc game and platform IDs.


<a id="sl-t036-expected"></a>

### Expected

Fortnite user included; halo user excluded from filtered results.


## SL-T037

<a id="sl-t037"></a>

<a id="sl-t037-setup"></a>

### Setup

Playwright chromium; active seed user with PeerOne discoverable on Fortnite/PC.


<a id="sl-t037-steps"></a>

### Steps

1. Open `/discover/search`.
2. Filter Game=Fortnite, Platform=PC; run search.
3. Open PeerOne profile from results.


<a id="sl-t037-expected"></a>

### Expected

URL reflects game/platform filters; PeerOne card shows shared game; profile displays Fortnite and PC.


## SL-T038

<a id="sl-t038"></a>

<a id="sl-t038-setup"></a>

### Setup

Vitest component project; mocked `listGames`, `listPlatforms`, and Next router/link.


<a id="sl-t038-steps"></a>

### Steps

Await async `DiscoverFilterPanel` render; assert heading, Game/Platform/Goal labels, and advanced search link.


<a id="sl-t038-expected"></a>

### Expected

Filter panel exposes search players heading, filter controls, and link to `/discover/search`.


## SL-T039

<a id="sl-t039"></a>

<a id="sl-t039-setup"></a>

### Setup

Two active users with completed profiles; `connection_requests_enabled` flag on.


<a id="sl-t039-steps"></a>

### Steps

1. Sender inserts pending request.
2. Verify sender and recipient visibility.
3. Attempt duplicate pending request.


<a id="sl-t039-expected"></a>

### Expected

Pending request visible to both parties; duplicate insert rejected.


## SL-T040

<a id="sl-t040"></a>

<a id="sl-t040-setup"></a>

### Setup

Sender and recipient active accounts; optional block between a third pair.


<a id="sl-t040-steps"></a>

### Steps

1. Sender inserts `connection_requests`.
2. Attempt duplicate pending request.
3. Recipient accepts; verify `connections` row.
4. Blocked pair attempts new request; outsider reads unrelated requests; sender attempts cancel via direct update.


<a id="sl-t040-expected"></a>

### Expected

Request visible to parties; duplicate blocked; acceptance creates connection; blocks prevent new requests; outsiders isolated; senders cannot cancel via table update.


## SL-T041

<a id="sl-t041"></a>

<a id="sl-t041-setup"></a>

### Setup

Two active users with completed profiles; `connection_requests_enabled` flag on.


<a id="sl-t041-steps"></a>

### Steps

1. Send pending request; recipient accepts.
2. Send pending request; recipient declines.
3. Send pending request; sender cancels.


<a id="sl-t041-expected"></a>

### Expected

Accept → request accepted and connection connected; decline → request declined; cancel → request cancelled.


## SL-T042

<a id="sl-t042"></a>

<a id="sl-t042-setup"></a>

### Setup

Blocker and blocked active accounts.


<a id="sl-t042-steps"></a>

### Steps

1. Insert `blocks` row.
2. Verify `block_enforcement_keys` and `accounts_blocked`.
3. Blocked user sends connection request.
4. Delete blocker account; re-check enforcement keys.


<a id="sl-t042-expected"></a>

### Expected

Enforcement keys sync; `accounts_blocked` true; blocked cannot send requests; enforcement keys survive blocker deletion.


## SL-T043

<a id="sl-t043"></a>

<a id="sl-t043-setup"></a>

### Setup

Blocker and blocked active users; `connection_requests_enabled` flag on.


<a id="sl-t043-steps"></a>

### Steps

1. Block then attempt new connection request from blocked party.
2. Pending request then block; attempt accept RPC.
3. Connected pair before block.


<a id="sl-t043-expected"></a>

### Expected

Blocked user cannot send new requests; accept fails when block exists; existing connection remains connected until archived.


## SL-T044

<a id="sl-t044"></a>

<a id="sl-t044-setup"></a>

### Setup

Vitest unit project; connection limit and message schema fixtures.


<a id="sl-t044-steps"></a>

### Steps

Exercise `connectionRequestLimitError` at pending and daily caps; validate `connectionRequestMessageSchema` with link and plain text.


<a id="sl-t044-expected"></a>

### Expected

Pending and daily caps return limit errors; under limits returns null; links rejected; short plain text accepted.


## SL-T045

<a id="sl-t045"></a>

<a id="sl-t045-setup"></a>

### Setup

Two browser contexts; password API sign-in (D14) for dev-active and dev-peer-1 seed users.


<a id="sl-t045-steps"></a>

### Steps

1. Both users open messages and confirm connection visible.
2. Sender opens PeerOne thread, sends unique message.
3. Recipient opens thread and reads message.


<a id="sl-t045-expected"></a>

### Expected

Connected pair appears in messages list; sent message delivered and visible to recipient.


## SL-T046

<a id="sl-t046"></a>

<a id="sl-t046-setup"></a>

### Setup

React Testing Library; mocked connection actions; pending incoming/outgoing request fixtures.


<a id="sl-t046-steps"></a>

### Steps

1. Accept incoming request.
2. Accept while action pending.
3. Cancel outgoing request.


<a id="sl-t046-expected"></a>

### Expected

Accept calls action once; buttons disabled during pending transition; cancel invokes cancel action for outgoing request.


## SL-T047

<a id="sl-t047"></a>

<a id="sl-t047-setup"></a>

### Setup

Same connection fixture as SL-T040 (shared `connections.test.sql`).


<a id="sl-t047-steps"></a>

### Steps

Exercise recipient acceptance path and participant visibility rules from the shared connection lifecycle test.


<a id="sl-t047-expected"></a>

### Expected

Recipient acceptance creates `connections` row; participants cannot see unrelated requests.


## SL-T048

<a id="sl-t048"></a>

<a id="sl-t048-setup"></a>

### Setup

Two active users; `connection_requests_enabled` on; pending request inserted then backdated.


<a id="sl-t048-steps"></a>

### Steps

1. Send pending connection request.
2. Sender backdates `expires_at`.
3. Recipient calls `accept_connection_request` RPC.


<a id="sl-t048-expected"></a>

### Expected

Accept RPC returns null without error; request row status becomes `expired`; no connection created.


## SL-T049

<a id="sl-t049"></a>

<a id="sl-t049-setup"></a>

### Setup

Connected pair with `conversations` row; optional block inserted mid-test.


<a id="sl-t049-steps"></a>

### Steps

1. Member sends message.
2. Non-member reads conversation.
3. Insert block; verify conversation hidden and send blocked.


<a id="sl-t049-expected"></a>

### Expected

Members send/read; non-members denied; blocking hides conversation and prevents sends.


## SL-T050

<a id="sl-t050"></a>

<a id="sl-t050-setup"></a>

### Setup

Connected users with conversation; `links_in_messages` flag toggled.


<a id="sl-t050-steps"></a>

### Steps

1. Send direct message as member.
2. Attempt message with URL when links disabled.


<a id="sl-t050-expected"></a>

### Expected

Message delivered to recipient; link body rejected when Q08 flag disabled.


## SL-T051

<a id="sl-t051"></a>

<a id="sl-t051-setup"></a>

### Setup

Connected users; notification service mocked for failure paths.


<a id="sl-t051-steps"></a>

### Steps

1. Send message with notification DB insert failing.
2. Send message with email post-commit failure.


<a id="sl-t051-expected"></a>

### Expected

Message row persists (Q07 post-commit); in-app notification created when email fails (D4 characterized).


## SL-T052

<a id="sl-t052"></a>

<a id="sl-t052-setup"></a>

### Setup

Connected pair with message; messaging and connection flags on.


<a id="sl-t052-steps"></a>

### Steps

1. Sender inserts message.
2. Recipient updates `conversation_members.last_read_at`.


<a id="sl-t052-expected"></a>

### Expected

Recipient membership last_read_at updated when conversation opened.


## SL-T053

<a id="sl-t053"></a>

<a id="sl-t053-setup"></a>

### Setup

Connected pair; blocker inserts `blocks` row.


<a id="sl-t053-steps"></a>

### Steps

Blocked user attempts to insert a new message in the shared conversation.


<a id="sl-t053-expected"></a>

### Expected

Insert rejected; blocked party cannot send new messages.


## SL-T054

<a id="sl-t054"></a>

<a id="sl-t054-setup"></a>

### Setup

React Testing Library; mocked `sendMessage` action; composer harness.


<a id="sl-t054-steps"></a>

### Steps

1. Submit empty draft.
2. Submit link draft; confirm send anyway.
3. Submit with server error.
4. Submit successful message.


<a id="sl-t054-expected"></a>

### Expected

Empty draft keeps send disabled; link blocked until confirmation; server errors shown in alert; draft cleared after success.


## SL-T055

<a id="sl-t055"></a>

<a id="sl-t055-setup"></a>

### Setup

Connected conversation; React Testing Library for hook; Supabase client mocked.


<a id="sl-t055-steps"></a>

### Steps

1. Integration: member A sends; member B receives via postgres_changes subscription.
2. Component: mount `useConversationRealtime`, unmount hook.


<a id="sl-t055-expected"></a>

### Expected

Realtime delivers inserts to subscribed member; hook removes channel on unmount.


## SL-T056

<a id="sl-t056"></a>

<a id="sl-t056-setup"></a>

### Setup

Connected pair; messaging and connection flags on.


<a id="sl-t056-steps"></a>

### Steps

1. User A sends message.
2. User B signs in fresh session and reads conversation messages.


<a id="sl-t056-expected"></a>

### Expected

Messages readable after simulated client reconnect with new session.


## SL-T057

<a id="sl-t057"></a>

<a id="sl-t057-setup"></a>

### Setup

pgTAP; connected pair with conversation and expired message row.


<a id="sl-t057-steps"></a>

### Steps

1. Verify expired message exists.
2. Call `purge_expired_messages(500)`.


<a id="sl-t057-expected"></a>

### Expected

Expired message present before purge; purge returns 1 and removes expired row.


## SL-T058

<a id="sl-t058"></a>

<a id="sl-t058-setup"></a>

### Setup

Connected pair; notification service with admin readback.


<a id="sl-t058-steps"></a>

### Steps

Call `createNewMessageNotification` for recipient after connect.


<a id="sl-t058-expected"></a>

### Expected

In-app `new_message` notification row inserted for recipient with title and href.


## SL-T059

<a id="sl-t059"></a>

<a id="sl-t059-setup"></a>

### Setup

Provisioned active user; actor session.


<a id="sl-t059-steps"></a>

### Steps

1. Read `notification_preferences`.
2. Upsert `email_new_message` false.
3. Read preferences again.


<a id="sl-t059-expected"></a>

### Expected

Owner reads and updates own notification preferences; email_new_message persists as false.


## SL-T060

<a id="sl-t060"></a>

<a id="sl-t060-setup"></a>

### Setup

Mocked Resend client; RESEND_API_KEY and FROM_EMAIL configured.


<a id="sl-t060-steps"></a>

### Steps

Call `sendNewMessageEmail` with recipient and conversation URL.


<a id="sl-t060-expected"></a>

### Expected

Resend send invoked once with correct to address and new-message subject.


## SL-T061

<a id="sl-t061"></a>

<a id="sl-t061-setup"></a>

### Setup

Two browser contexts; password API sign-in for dev-active and dev-peer-1; unique message namespace.


<a id="sl-t061-steps"></a>

### Steps

1. User A sends message in shared conversation.
2. User B opens thread, sees message, replies.
3. User A reloads and sees reply.


<a id="sl-t061-expected"></a>

### Expected

Bidirectional chat works; messages persist across reload (realtime/poll characterized per D12).


## SL-T062

<a id="sl-t062"></a>

<a id="sl-t062-setup"></a>

### Setup

Playwright a11y project; active seed user signed in; Q22 serious/critical gate.


<a id="sl-t062-steps"></a>

### Steps

Navigate to `/messages` and run axe wcag2a/2aa/21aa/22aa scan.


<a id="sl-t062-expected"></a>

### Expected

Messages list route has zero serious/critical accessibility violations.


## SL-T063

<a id="sl-t063"></a>

<a id="sl-t063-setup"></a>

### Setup

Connected pair with conversation and catalog game/platform.


<a id="sl-t063-steps"></a>

### Steps

Proposer inserts `play_invitations` row for connected recipient.


<a id="sl-t063-expected"></a>

### Expected

Invitation row created with proposer/recipient/conversation linkage.


## SL-T064

<a id="sl-t064"></a>

<a id="sl-t064-setup"></a>

### Setup

Connected pair; scheduled play with invalid slot payload (Q10).


<a id="sl-t064-steps"></a>

### Steps

Propose play with scheduling mode that fails slot validation.


<a id="sl-t064-expected"></a>

### Expected

Invitation row remains; atomic slot validation failure does not orphan partial state (D5 characterized).


## SL-T065

<a id="sl-t065"></a>

<a id="sl-t065-setup"></a>

### Setup

Connected pair with conversation; third non-participant account.


<a id="sl-t065-steps"></a>

### Steps

1. Proposer inserts `play_invitations`.
2. Non-participant reads invitations.
3. Insert block; proposer reads invitations again.


<a id="sl-t065-expected"></a>

### Expected

Proposer insert succeeds; non-participant sees zero rows; blocked pair cannot read invitations.


## SL-T066

<a id="sl-t066"></a>

<a id="sl-t066-setup"></a>

### Setup

Connected pair with proposed play invitation; play and connection flags on.


<a id="sl-t066-steps"></a>

### Steps

1. Recipient declines proposed invitation.
2. Accept invitation then cancel confirmed gaming session.


<a id="sl-t066-expected"></a>

### Expected

Decline → invitation status declined; cancel → gaming session status cancelled.


## SL-T067

<a id="sl-t067"></a>

<a id="sl-t067-setup"></a>

### Setup

Connected pair with accepted flexible play invitation.


<a id="sl-t067-steps"></a>

### Steps

Recipient accepts invitation; verify `gaming_sessions` row.


<a id="sl-t067-expected"></a>

### Expected

Gaming session created when flexible invitation is accepted.


## SL-T068

<a id="sl-t068"></a>

<a id="sl-t068-setup"></a>

### Setup

Vitest unit project; play timezone helper fixtures.


<a id="sl-t068-steps"></a>

### Steps

Exercise `formatInTimeZone`, `formatSessionRange`, `datetimeLocalToUtcIso`, and `generateIcsEvent`.


<a id="sl-t068-expected"></a>

### Expected

LA formatting produces readable label; matching zones yield single label; differing zones yield other label; local datetime converts to UTC; ICS contains VEVENT with DTSTART/DTEND.


## SL-T069

<a id="sl-t069"></a>

<a id="sl-t069-setup"></a>

### Setup

Vitest api project; mocked session user, account, and session detail queries.


<a id="sl-t069-steps"></a>

### Steps

1. GET calendar route with no session.
2. GET with session but missing session detail.
3. GET as authorized participant.


<a id="sl-t069-expected"></a>

### Expected

No session → 401; invisible session → 404; authorized participant → 200 text/calendar attachment with VCALENDAR and game name.


## SL-T070

<a id="sl-t070"></a>

<a id="sl-t070-setup"></a>

### Setup

Connected pair with accepted play session; play and connection flags on.


<a id="sl-t070-steps"></a>

### Steps

Participant upserts `post_play_feedback` with continuation `play_again`.


<a id="sl-t070-expected"></a>

### Expected

Feedback row stored with continuation value for session participant.


## SL-T071

<a id="sl-t071"></a>

<a id="sl-t071-setup"></a>

### Setup

Confirmed play session starting within 24h window; play and connection flags on.


<a id="sl-t071-steps"></a>

### Steps

Run `runPlayReminders` job.


<a id="sl-t071-expected"></a>

### Expected

Reminder notifications created for sessions in the 24-hour window.


## SL-T072

<a id="sl-t072"></a>

<a id="sl-t072-setup"></a>

### Setup

Two browser contexts; cleared open invitations; password API sign-in for proposer and recipient.


<a id="sl-t072-steps"></a>

### Steps

1. Proposer sends play invitation from conversation.
2. Recipient accepts from `/play` open invitations.
3. Proposer views confirmed session.


<a id="sl-t072-expected"></a>

### Expected

Invitation moves proposed → accepted; both parties see confirmed play session.


## SL-T073

<a id="sl-t073"></a>

<a id="sl-t073-setup"></a>

### Setup

Vitest component project; sample `PlayInvitationListItem` fixture.


<a id="sl-t073-steps"></a>

### Steps

Render `PlayInvitationCard` with incoming proposed invitation; assert profile link, status line, game/platform, and detail link.


<a id="sl-t073-expected"></a>

### Expected

Card shows peer profile link, direction/status, game/platform summary, and invitation detail href.


## SL-T074

<a id="sl-t074"></a>

<a id="sl-t074-setup"></a>

### Setup

Two connected accounts with `teammate_relationships` and `teammate_notes`.


<a id="sl-t074-steps"></a>

### Steps

1. Participant reads relationship.
2. Author writes private note.
3. Other participant, outsider, and blocked participant attempt reads.


<a id="sl-t074-expected"></a>

### Expected

Participants read relationships; authors write notes; other participant, outsider, and blocked users denied.


## SL-T075

<a id="sl-t075"></a>

<a id="sl-t075-setup"></a>

### Setup

Connected pair with completed play session; teammates and play flags on.


<a id="sl-t075-steps"></a>

### Steps

1. Complete gaming session.
2. Proposer calls `propose_teammate` RPC.
3. Read `teammate_relationships`.


<a id="sl-t075-expected"></a>

### Expected

Teammate relationship row created with ordered pair, connection linkage, and proposed/teammate/regular_teammate status.


## SL-T076

<a id="sl-t076"></a>

<a id="sl-t076-setup"></a>

### Setup

Shared teammate fixture (same file as SL-T074).


<a id="sl-t076-steps"></a>

### Steps

Verify note privacy: only the authoring participant can read their private `teammate_notes`.


<a id="sl-t076-expected"></a>

### Expected

Non-authors cannot read another user's teammate notes.


## SL-T077

<a id="sl-t077"></a>

<a id="sl-t077-setup"></a>

### Setup

Owner on free tier; second account as non-member.


<a id="sl-t077-steps"></a>

### Steps

1. Owner creates private group.
2. Non-member reads group.
3. Owner attempts second active owned group.


<a id="sl-t077-expected"></a>

### Expected

Owner creates group; non-member sees zero rows; free tier rejects second active owned group.


## SL-T078

<a id="sl-t078"></a>

<a id="sl-t078-setup"></a>

### Setup

Active owner on free tier.


<a id="sl-t078-steps"></a>

### Steps

Owner calls `create_private_group` RPC with name and capacity.


<a id="sl-t078-expected"></a>

### Expected

Private group row created for owner (Q11/D7 entitlement rules apply).


## SL-T079

<a id="sl-t079"></a>

<a id="sl-t079-setup"></a>

### Setup

Small private group with pending invitee and member voters.


<a id="sl-t079-steps"></a>

### Steps

1. Invite member; assert `pending_approval`.
2. Cast insufficient votes.
3. Meet quorum; assert `active` membership.


<a id="sl-t079-expected"></a>

### Expected

Single approval insufficient; quorum activates invitee.


## SL-T080

<a id="sl-t080"></a>

<a id="sl-t080-setup"></a>

### Setup

Private group with owner and non-member accounts.


<a id="sl-t080-steps"></a>

### Steps

1. Owner calls `transfer_private_group_ownership`.
2. Non-member attempts transfer.


<a id="sl-t080-expected"></a>

### Expected

Owner transfer updates `owner_account_id`; non-member transfer rejected.


## SL-T081

<a id="sl-t081"></a>

<a id="sl-t081-setup"></a>

### Setup

Group owner and non-member; group activated with conversation.


<a id="sl-t081-steps"></a>

### Steps

1. Owner creates group and conversation.
2. Non-member reads group conversation.
3. Owner sends group message.


<a id="sl-t081-expected"></a>

### Expected

Non-member cannot read conversation before joining; owner can send messages.


## SL-T082

<a id="sl-t082"></a>

<a id="sl-t082-setup"></a>

### Setup

pgTAP; active group owner authenticated.


<a id="sl-t082-steps"></a>

### Steps

Create private group, activate it, insert open seat as group member.


<a id="sl-t082-expected"></a>

### Expected

Group member can create open seat row via RLS.


## SL-T083

<a id="sl-t083"></a>

<a id="sl-t083-setup"></a>

### Setup

Active owner; `private_groups_enabled` flag on.


<a id="sl-t083-steps"></a>

### Steps

1. Call `create_private_group` RPC.
2. Activate group.
3. Call `create_conversation_for_group`.


<a id="sl-t083-expected"></a>

### Expected

Group created; conversation provisioned with kind `group` and matching group_id.


## SL-T084

<a id="sl-t084"></a>

<a id="sl-t084-setup"></a>

### Setup

Active user with PeerOne connection; cleared owned groups; `private_groups_enabled` via seed.


<a id="sl-t084-steps"></a>

### Steps

1. Create group at `/groups/new` with PeerOne invite.
2. Assert group URL, member count, and pending invitation UI.


<a id="sl-t084-expected"></a>

### Expected

Group created in forming state with 1/4 members and PeerOne pending invitation (Q12 group chat characterized separately).


## SL-T085

<a id="sl-t085"></a>

<a id="sl-t085-setup"></a>

### Setup

Playwright a11y project; cleared owned groups; active user signed in; `private_groups_enabled` on.


<a id="sl-t085-steps"></a>

### Steps

Navigate to `/groups/new` and run axe wcag2a/2aa/21aa/22aa scan.


<a id="sl-t085-expected"></a>

### Expected

New group form route has zero serious/critical accessibility violations.


## SL-T086

<a id="sl-t086"></a>

<a id="sl-t086-setup"></a>

### Setup

Reporter with message in conversation.


<a id="sl-t086-steps"></a>

### Steps

Reporter files report and opens moderation case with message context.


<a id="sl-t086-expected"></a>

### Expected

Report and case created (Q13/Q14); message excerpt captured as evidence (D6 characterized).


## SL-T087

<a id="sl-t087"></a>

<a id="sl-t087-setup"></a>

### Setup

Reporter with message in conversation; outsider account.


<a id="sl-t087-steps"></a>

### Steps

1. Reporter files report with `include_message_context`.
2. Reporter opens moderation case.
3. Outsider opens case from reporter's report.


<a id="sl-t087-expected"></a>

### Expected

Case opens with `message_excerpt` evidence; outsider cannot open another user's case.


## SL-T088

<a id="sl-t088"></a>

<a id="sl-t088-setup"></a>

### Setup

Blocker and blocked users.


<a id="sl-t088-steps"></a>

### Steps

Blocked user attempts to file report against blocker.


<a id="sl-t088-expected"></a>

### Expected

Report rejected when block exists (Q03 current behavior).


## SL-T089

<a id="sl-t089"></a>

<a id="sl-t089-setup"></a>

### Setup

Vitest unit project; moderation severity keyword fixtures.


<a id="sl-t089-steps"></a>

### Steps

Call `assignReportSeverity` for imminent harm, harassment, inappropriate content, and spam.


<a id="sl-t089-expected"></a>

### Expected

Imminent harm → p0; harassment → p1; inappropriate content → p2; spam → p3.


## SL-T090

<a id="sl-t090"></a>

<a id="sl-t090-setup"></a>

### Setup

Reporter case; support-scoped and safety_review admin fixtures.


<a id="sl-t090-steps"></a>

### Steps

1. Non-admin attempts case claim.
2. Support admin attempts claim.
3. Safety review admin claims case.


<a id="sl-t090-expected"></a>

### Expected

Only safety_review admin with MFA fixture can claim moderation cases (Q15).


## SL-T091

<a id="sl-t091"></a>

<a id="sl-t091-setup"></a>

### Setup

Reporter, `safety_review` admin, and non-admin accounts.


<a id="sl-t091-steps"></a>

### Steps

1. Reporter opens case.
2. Admin claims and applies `restrict_discovery`.
3. Non-admin attempts claim.


<a id="sl-t091-expected"></a>

### Expected

Admin claim and action recorded; non-admin claim rejected.


## SL-T092

<a id="sl-t092"></a>

<a id="sl-t092-setup"></a>

### Setup

Safety admin and non-admin; moderation case with evidence.


<a id="sl-t092-steps"></a>

### Steps

Non-admin and safety admin attempt to read `moderation_evidence`.


<a id="sl-t092-expected"></a>

### Expected

Evidence readable only by safety-scoped admins.


## SL-T093

<a id="sl-t093"></a>

<a id="sl-t093-setup"></a>

### Setup

Subject and safety-review admin; moderation case with warn action.


<a id="sl-t093-steps"></a>

### Steps

1. Admin applies warn action.
2. Subject submits appeal within window.
3. Subject attempts duplicate appeal.


<a id="sl-t093-expected"></a>

### Expected

Appeal submitted successfully; duplicate appeal rejected.


## SL-T094

<a id="sl-t094"></a>

<a id="sl-t094-setup"></a>

### Setup

pgTAP; moderation case with open action, expired penalty, and reversed appeal.


<a id="sl-t094-steps"></a>

### Steps

1. Check release eligibility on open case.
2. Insert expired penalty; recheck.
3. Insert reversed appeal action; recheck.


<a id="sl-t094-expected"></a>

### Expected

Open case not releasable; expired penalty releasable; reversed appeal releasable.


## SL-T095

<a id="sl-t095"></a>

<a id="sl-t095-setup"></a>

### Setup

Admin with security_break_glass scope and outsider user.


<a id="sl-t095-steps"></a>

### Steps

1. Admin reads feature_flags.
2. Service role toggles flag.
3. Outsider attempts update.
4. Admin re-reads flag.


<a id="sl-t095-expected"></a>

### Expected

Admin reads flags; service role update succeeds; outsider update denied; toggled value persists.


## SL-T096

<a id="sl-t096"></a>

<a id="sl-t096-setup"></a>

### Setup

Catalog admin with catalog scope and outsider user.


<a id="sl-t096-steps"></a>

### Steps

1. Catalog admin reads games table.
2. Outsider reads public games.


<a id="sl-t096-expected"></a>

### Expected

Catalog admin reads fortnite row; outsider can read active public game catalog.


## SL-T097

<a id="sl-t097"></a>

<a id="sl-t097-setup"></a>

### Setup

Owner with locale, profile, and active `user_games`; outsider account.


<a id="sl-t097-steps"></a>

### Steps

1. Owner calls `export_account_data`.
2. Outsider calls export for owner's account id.


<a id="sl-t097-expected"></a>

### Expected

Export includes locale, games array, and display name; outsider receives null payload.


## SL-T098

<a id="sl-t098"></a>

<a id="sl-t098-setup"></a>

### Setup

Service role inserts `audit_events` test row.


<a id="sl-t098-steps"></a>

### Steps

1. Authenticated role attempts update.
2. Attempt delete.
3. Attempt insert.


<a id="sl-t098-expected"></a>

### Expected

Update blocked by RLS deny policy; authenticated role has no INSERT or DELETE table privileges on `audit_events`.


## SL-T099

<a id="sl-t099"></a>

<a id="sl-t099-setup"></a>

### Setup

Playwright chromium; active seed user (Q15: full admin MFA flow deferred).


<a id="sl-t099-steps"></a>

### Steps

Navigate to `/settings/safety` as active user.


<a id="sl-t099-expected"></a>

### Expected

Safety settings heading visible; full report→admin→appeal journey covered by integration/pgTAP until AAL2 Playwright fixture exists.


## SL-T100

<a id="sl-t100"></a>

<a id="sl-t100-setup"></a>

### Setup

Vitest api + unit projects; Stripe webhook signature mocks.


<a id="sl-t100-steps"></a>

### Steps

1. API route: valid/invalid signature, unknown event, replay.
2. Unit: processStripeEvent subscription lifecycle.


<a id="sl-t100-expected"></a>

### Expected

Route returns 400 on bad signature; events processed idempotently; subscription status updated.


## SL-T101

<a id="sl-t101"></a>

<a id="sl-t101-setup"></a>

### Setup

Active user with subscription row; Package D contract.


<a id="sl-t101-steps"></a>

### Steps

Process `customer.subscription.updated` webhook via `processStripeEvent`.


<a id="sl-t101-expected"></a>

### Expected

Subscription status becomes `active`; stripe_subscription_id stored; entitlements follow mapped status (Q19).


## SL-T102

<a id="sl-t102"></a>

<a id="sl-t102-setup"></a>

### Setup

User with subscription activated then updated.


<a id="sl-t102-steps"></a>

### Steps

Apply initial activation webhook, then later subscription.updated event.


<a id="sl-t102-expected"></a>

### Expected

Later event updates subscription without regressing state.


## SL-T103

<a id="sl-t103"></a>

<a id="sl-t103-setup"></a>

### Setup

Canceled subscription user.


<a id="sl-t103-steps"></a>

### Steps

Verify read-only entitlements; exercise resubscribe checkout exemption (Q17).


<a id="sl-t103-expected"></a>

### Expected

Canceled accounts read-only for writes; checkout path exempt from read-only guard (D3).


## SL-T104

<a id="sl-t104"></a>

<a id="sl-t104-setup"></a>

### Setup

User with subscription row.


<a id="sl-t104-steps"></a>

### Steps

1. Set canceled subscription; recompute entitlements.
2. Seed stripe customer metadata on subscription.


<a id="sl-t104-expected"></a>

### Expected

Read-only entitlements when canceled; customer metadata persisted.


## SL-T105

<a id="sl-t105"></a>

<a id="sl-t105-setup"></a>

### Setup

pgTAP; plus-tier user A and user B with saved_searches RLS.


<a id="sl-t105-steps"></a>

### Steps

1. Plus user inserts saved search.
2. Owner reads own searches.
3. Outsider reads user A searches.
4. Outsider attempts insert for user A.
5. Owner deletes own search.


<a id="sl-t105-expected"></a>

### Expected

Owner CRUD on own rows; outsider cannot read or insert for another account.


## SL-T106

<a id="sl-t106"></a>

<a id="sl-t106-setup"></a>

### Setup

Active users; fixture admin and entitlements recompute RPC.


<a id="sl-t106-steps"></a>

### Steps

1. Recompute entitlements for free-tier account.
2. Upsert active subscription; recompute for plus account.


<a id="sl-t106-expected"></a>

### Expected

Free tier limits match FREE_LIMITS; plus subscription yields plus tier with PLUS_LIMITS caps.


## SL-T107

<a id="sl-t107"></a>

<a id="sl-t107-setup"></a>

### Setup

Active user without Stripe subscription.


<a id="sl-t107-steps"></a>

### Steps

Confirm deletion with password re-auth via billing deletion flow.


<a id="sl-t107-expected"></a>

### Expected

Deletion confirmed per Q16 when no Stripe cancel required (D2).


## SL-T108

<a id="sl-t108"></a>

<a id="sl-t108-setup"></a>

### Setup

Local stub: `stripe_enabled` flag on; active user; read-only toggle harness. Staging: `STAGING_BASE_URL` set.


<a id="sl-t108-steps"></a>

### Steps

1. Local: visit `/subscription`, assert upgrade CTA; toggle read-only and assert lapse messaging.
2. Staging: open subscription page (checkout wiring fixme until credentials approved).


<a id="sl-t108-expected"></a>

### Expected

Local stub shows billing management and read-only messaging; staging spec skips without STAGING_BASE_URL and documents Stripe lifecycle gap.


## SL-T109

<a id="sl-t109"></a>

<a id="sl-t109-setup"></a>

### Setup

`relation_security_expectations` manifest loaded for all public tables.


<a id="sl-t109-steps"></a>

### Steps

Run manifest audit comparing RLS enablement, role grants, and authenticated policies to expectations.


<a id="sl-t109-expected"></a>

### Expected

Every public table matches manifest: RLS state, grants, and policy operations align with classification.


## SL-T110

<a id="sl-t110"></a>

<a id="sl-t110-setup"></a>

### Setup

Vitest api project; CRON_SECRET env.


<a id="sl-t110-steps"></a>

### Steps

Call cron routes with missing, wrong, and correct `Authorization: Bearer` secret.


<a id="sl-t110-expected"></a>

### Expected

Missing/wrong secret → 401; correct secret → 200 (Q21; D1 fail-closed characterized).


## SL-T111

<a id="sl-t111"></a>

<a id="sl-t111-setup"></a>

### Setup

Local Supabase; message purge job harness.


<a id="sl-t111-steps"></a>

### Steps

Run `runMessagePurge` twice in succession.


<a id="sl-t111-expected"></a>

### Expected

First run deletes ≥ 0 rows; second run returns zero deleted (idempotent hourly purge).


## SL-T112

<a id="sl-t112"></a>

<a id="sl-t112-setup"></a>

### Setup

Vitest api project; mocked Supabase database probe.


<a id="sl-t112-steps"></a>

### Steps

1. Probe succeeds.
2. Probe returns error.
3. Probe throws.


<a id="sl-t112-expected"></a>

### Expected

Healthy → 200 app/database ok; degraded probe → 503 database degraded (Q20); thrown probe → 503 database unavailable.


## SL-T113

<a id="sl-t113"></a>

<a id="sl-t113-setup"></a>

### Setup

Vitest unit-decision project; smoke-post-deploy script source.


<a id="sl-t113-steps"></a>

### Steps

1. Assert script references health endpoint and ok check.
2. Characterize degraded vs unavailable acceptance.


<a id="sl-t113-expected"></a>

### Expected

Smoke script documents `/api/health` check; 200 passes; 503 fails; degraded-health still-passes decision recorded.


## SL-T114

<a id="sl-t114"></a>

<a id="sl-t114-setup"></a>

### Setup

Vitest unit project; Sentry helpers with env stubs.


<a id="sl-t114-steps"></a>

### Steps

Exercise `scrubValue` on sensitive keys, `captureException` dev stub, and document D9 nested scrub gap.


<a id="sl-t114-expected"></a>

### Expected

Top-level sensitive keys redacted; dev capture is no-op; nested scrub limitation characterized (D9).


## SL-T115

<a id="sl-t115"></a>

<a id="sl-t115-setup"></a>

### Setup

Vitest unit project; analytics event tracker.


<a id="sl-t115-steps"></a>

### Steps

Track allowlisted events, reject unknown events, verify replay-off posture (D10 property scrub gap documented).


<a id="sl-t115-expected"></a>

### Expected

Allowlisted events succeed; unknown events throw; sensitive property scrub gap characterized (D10).


## SL-T116

<a id="sl-t116"></a>

<a id="sl-t116-setup"></a>

### Setup

Playwright a11y project; axe wcag2a/2aa/21aa/22aa tags; public, onboarding, and active-user journey routes.


<a id="sl-t116-steps"></a>

### Steps

Scan each route in PUBLIC_ROUTES, onboarding attestation, and authenticated JOURNEY_ROUTES for serious/critical violations.


<a id="sl-t116-expected"></a>

### Expected

Zero serious/critical axe violations per Q22 open default on all listed journey routes.


## SL-T117

<a id="sl-t117"></a>

<a id="sl-t117-setup"></a>

### Setup

Playwright a11y project; keyboard-only interaction on sign-in and discover search.


<a id="sl-t117-steps"></a>

### Steps

1. Tab through sign-in form, submit with Enter.
2. Signed-in user focuses discover search/filter controls.


<a id="sl-t117-expected"></a>

### Expected

Sign-in operable via keyboard; discover search maintains focus semantics after opening filters.


## SL-T118

<a id="sl-t118"></a>

<a id="sl-t118-setup"></a>

### Setup

Playwright chromium; active seed user; mobile viewport sizes 320px, 412px, and landscape.


<a id="sl-t118-steps"></a>

### Steps

Visit `/discover`, `/messages`, `/profile`, `/play` at 320px; repeat discover at Pixel 7 size; profile in landscape mobile.


<a id="sl-t118-expected"></a>

### Expected

Core route headings visible; no horizontal body scroll at 320px; layouts usable on mobile viewports.


## SL-T119

<a id="sl-t119"></a>

<a id="sl-t119-setup"></a>

### Setup

Vitest env stubs; CI `env-production-gate` job without SKIP_ENV_VALIDATION.


<a id="sl-t119-steps"></a>

### Steps

1. Import env with SKIP_ENV_VALIDATION and placeholders.
2. Import without service role key.
3. Import production without CRON_SECRET.
4. CI: production build with required env vars, no skip flag.


<a id="sl-t119-expected"></a>

### Expected

Skip flag accepts placeholders; missing service role or CRON_SECRET throws; CI production build passes env gate.


## SL-T120

<a id="sl-t120"></a>

<a id="sl-t120-setup"></a>

### Setup

k6 with staging/local env: BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD.


<a id="sl-t120-steps"></a>

### Steps

Run `npm run test:load:realtime` ramping 100 VUs with 5m steady state; subscribe to realtime messages channel.


<a id="sl-t120-expected"></a>

### Expected

delivery rate >99%, join p95 <2s, join error <1%, zero duplicate message IDs, zero unauthorized joins (plan §N).

