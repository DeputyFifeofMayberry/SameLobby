Generated from tests/test-inventory.json — do not edit

# Phase 6 implementations

| Key | Priority | Layer | File | Package |
|---|---|---|---|---|
| SL-T004:unit | P1 | unit | `src/lib/rate-limit.test.ts` | 6.1 |
| SL-T004:integration | P1 | integration | `tests/integration/auth/rate-limit.test.ts` | 6.1 |
| SL-T008:integration | P1 | integration | `tests/integration/auth/password-reset.test.ts` | 6.1 |
| SL-T009:component | P1 | component | `src/components/auth/ResetPasswordForm.test.tsx` | 6.9 |
| SL-T018:unit | P1 | unit | `src/domains/profile/schemas.test.ts` | 6.2 |
| SL-T020:integration | P1 | integration | `tests/integration/profile/current-intent.test.ts` | 6.2 |
| SL-T021:db | P1 | database | `supabase/tests/rls/availability.test.sql` | 6.2 |
| SL-T024:integration | P1 | integration | `tests/integration/profile/games.test.ts` | 6.2 |
| SL-T026:db | P1 | database | `supabase/tests/rls/catalog_seed.test.sql` | 6.2 |
| SL-T029:unit | P1 | unit | `src/domains/discovery/cohort.test.ts` | 6.3 |
| SL-T031:integration | P1 | integration | `tests/integration/discovery/recommendations.test.ts` | 6.3 |
| SL-T032:unit | P1 | unit | `src/domains/discovery/recommend.test.ts` | 6.3 |
| SL-T033:integration | P1 | integration | `tests/integration/discovery/density.test.ts` | 6.3 |
| SL-T034:db | P1 | database | `supabase/tests/rls/discovery.test.sql` | 6.3 |
| SL-T035:integration | P1 | integration | `tests/integration/discovery/pause.test.ts` | 6.3 |
| SL-T036:integration | P1 | integration | `tests/integration/discovery/filters.test.ts` | 6.3 |
| SL-T041:integration | P1 | integration | `tests/integration/connections/transitions.test.ts` | 6.4 |
| SL-T043:integration | P1 | integration | `tests/integration/connections/block.test.ts` | 6.4 |
| SL-T044:unit | P1 | unit | `src/domains/connections/schemas.test.ts` | 6.4 |
| SL-T046:component | P1 | component | `src/components/connections/ConnectionRequestCard.test.tsx` | 6.9 |
| SL-T052:integration | P1 | integration | `tests/integration/messaging/read-state.test.ts` | 6.5 |
| SL-T054:component | P1 | component | `src/components/messaging/MessageComposer.test.tsx` | 6.9 |
| SL-T056:integration | P1 | integration | `tests/integration/messaging/reconnect.test.ts` | 6.5 |
| SL-T057:db | P1 | database | `supabase/tests/retention/messages.test.sql` | 6.5 |
| SL-T058:integration | P1 | integration | `tests/integration/notifications/service.test.ts` | 6.5 |
| SL-T059:integration | P1 | integration | `tests/integration/notifications/preferences.test.ts` | 6.5 |
| SL-T060:integration | P1 | integration | `tests/integration/email/client.test.ts` | 6.5 |
| SL-T066:integration | P1 | integration | `tests/integration/play/transitions.test.ts` | 6.6 |
| SL-T068:unit | P1 | unit | `src/domains/play/timezone.test.ts` | 6.6 |
| SL-T069:api | P1 | api | `tests/api/play-calendar.test.ts` | 6.6 |
| SL-T070:integration | P1 | integration | `tests/integration/play/feedback.test.ts` | 6.6 |
| SL-T071:integration | P1 | integration | `tests/integration/jobs/play-reminders.test.ts` | 6.8 |
| SL-T075:integration | P1 | integration | `tests/integration/teammates/lifecycle.test.ts` | 6.6 |
| SL-T082:db | P1 | database | `supabase/tests/rls/group_open_seats.test.sql` | 6.6 |
| SL-T083:integration | P1 | integration | `tests/integration/groups/conversation.test.ts` | 6.6 |
| SL-T089:unit | P1 | unit | `src/domains/moderation/schemas.test.ts` | 6.7 |
| SL-T093:integration | P1 | integration | `tests/integration/admin/appeals.test.ts` | 6.7 |
| SL-T094:db | P1 | database | `supabase/tests/rls/moderation_release.test.sql` | 6.7 |
| SL-T095:integration | P1 | integration | `tests/integration/admin/feature-controls.test.ts` | 6.7 |
| SL-T096:integration | P1 | integration | `tests/integration/admin/catalog.test.ts` | 6.7 |
| SL-T105:db | P1 | database | `supabase/tests/rls/saved_searches.test.sql` | 6.7 |
| SL-T106:integration | P1 | integration | `tests/integration/billing/entitlements.test.ts` | 6.7 |
| SL-T111:integration | P1 | integration | `tests/integration/jobs/idempotency.test.ts` | 6.8 |
| SL-T112:api | P1 | api | `tests/api/health.test.ts` | 6.8 |
| SL-T113:unit-decision | P1 | unit | `tests/unit/scripts/smoke-post-deploy.test.ts` | 6.8 |
| SL-T119:unit-env | P1 | unit | `src/lib/env.test.ts` | 6.8 |
| SL-T119:ci-env-gate | P1 | ci | `.github/workflows/ci.yml` | 6.8 |
