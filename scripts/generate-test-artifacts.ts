/**
 * One-shot generator for planning PR artifacts.
 * Run: npx tsx scripts/generate-test-artifacts.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const BASELINE_SHA = "ed10f19e528b6ec406553795cf2cd891427fe668";

type St = "M" | "P" | "E" | "R";
type Row = {
  key: string;
  pri: "P0" | "P1" | "P2";
  st: St;
  layer: string;
  file: string;
  ph: number;
  pkg: string;
  prod: string;
  devCommand: string;
  suiteCommand: string;
};

const MATRIX: Row[] = [
  {
    key: "SL-T001:e2e",
    pri: "P0",
    st: "M",
    layer: "E2E",
    file: "e2e/auth/protected-routes.spec.ts",
    ph: 3,
    pkg: "3.1",
    prod: "No",
    devCommand:
      "npx playwright test e2e/auth/protected-routes.spec.ts --project=chromium-p0",
    suiteCommand: "npm run test:e2e:p0",
  },
  {
    key: "SL-T002:unit",
    pri: "P0",
    st: "M",
    layer: "Unit",
    file: "src/domains/accounts/account-guard.test.ts",
    ph: 3,
    pkg: "3.1",
    prod: "No",
    devCommand:
      "npx vitest run --project unit src/domains/accounts/account-guard.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T003:integration",
    pri: "P0",
    st: "P",
    layer: "Integration",
    file: "tests/integration/auth/registration.test.ts",
    ph: 3,
    pkg: "3.1",
    prod: "Q01",
    devCommand:
      "npx vitest run --project integration tests/integration/auth/registration.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T003:db-cap",
    pri: "P0",
    st: "P",
    layer: "Database",
    file: "supabase/tests/rls/registration_cap.test.sql",
    ph: 3,
    pkg: "3.1",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/registration_cap.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T004:unit",
    pri: "P1",
    st: "M",
    layer: "Unit",
    file: "src/lib/rate-limit.test.ts",
    ph: 6,
    pkg: "6.1",
    prod: "Q02",
    devCommand: "npx vitest run --project unit src/lib/rate-limit.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T004:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/auth/rate-limit.test.ts",
    ph: 6,
    pkg: "6.1",
    prod: "Q02",
    devCommand:
      "npx vitest run --project integration tests/integration/auth/rate-limit.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T005:db",
    pri: "P0",
    st: "M",
    layer: "Database",
    file: "supabase/tests/auth/provisioning.test.sql",
    ph: 2,
    pkg: "2.2",
    prod: "No",
    devCommand: "supabase test db supabase/tests/auth/provisioning.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T006:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/auth/sign-in.test.ts",
    ph: 3,
    pkg: "3.1",
    prod: "Q01",
    devCommand:
      "npx vitest run --project integration tests/integration/auth/sign-in.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T007:api",
    pri: "P0",
    st: "M",
    layer: "API",
    file: "tests/api/auth-callback.test.ts",
    ph: 3,
    pkg: "3.1",
    prod: "No",
    devCommand: "npx vitest run --project api tests/api/auth-callback.test.ts",
    suiteCommand: "npm run test:api:p0",
  },
  {
    key: "SL-T008:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/auth/password-reset.test.ts",
    ph: 6,
    pkg: "6.1",
    prod: "Q01",
    devCommand:
      "npx vitest run --project integration tests/integration/auth/password-reset.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T009:component",
    pri: "P1",
    st: "M",
    layer: "Component",
    file: "src/components/auth/ResetPasswordForm.test.tsx",
    ph: 6,
    pkg: "6.9",
    prod: "No",
    devCommand:
      "npx vitest run --project component src/components/auth/ResetPasswordForm.test.tsx",
    suiteCommand: "npm run test:component",
  },
  {
    key: "SL-T010:e2e",
    pri: "P0",
    st: "M",
    layer: "E2E",
    file: "e2e/auth/session-expiry.spec.ts",
    ph: 3,
    pkg: "3.1",
    prod: "D14",
    devCommand:
      "npx playwright test e2e/auth/session-expiry.spec.ts --project=chromium-p0",
    suiteCommand: "npm run test:e2e:p0",
  },
  {
    key: "SL-T011:integration",
    pri: "P0",
    st: "P",
    layer: "Integration",
    file: "tests/integration/accounts/attestation.test.ts",
    ph: 3,
    pkg: "3.2",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/accounts/attestation.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T012:db",
    pri: "P0",
    st: "M",
    layer: "Database",
    file: "supabase/tests/rls/attestation.test.sql",
    ph: 2,
    pkg: "2.2",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/attestation.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T013:integration",
    pri: "P0",
    st: "P",
    layer: "Integration",
    file: "tests/integration/accounts/deletion-request.test.ts",
    ph: 3,
    pkg: "3.2",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/accounts/deletion-request.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T014:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/accounts/deletion-confirmation.test.ts",
    ph: 4,
    pkg: "4.7",
    prod: "D2/Q16",
    devCommand:
      "npx vitest run --project integration tests/integration/accounts/deletion-confirmation.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T015:db",
    pri: "P0",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/deletion_pipeline.test.sql",
    ph: 2,
    pkg: "2.2",
    prod: "No",
    devCommand:
      "supabase test db supabase/tests/rls/deletion_pipeline.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T016:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/profile/onboarding-order.test.ts",
    ph: 3,
    pkg: "3.3",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/profile/onboarding-order.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T017:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/profile/identity.test.ts",
    ph: 3,
    pkg: "3.3",
    prod: "D11",
    devCommand:
      "npx vitest run --project integration tests/integration/profile/identity.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T018:unit",
    pri: "P1",
    st: "E",
    layer: "Unit",
    file: "src/domains/profile/schemas.test.ts",
    ph: 6,
    pkg: "6.2",
    prod: "No",
    devCommand:
      "npx vitest run --project unit src/domains/profile/schemas.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T019:db",
    pri: "P0",
    st: "M",
    layer: "Database",
    file: "supabase/tests/rls/user_games.test.sql",
    ph: 2,
    pkg: "2.3",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/user_games.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T020:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/profile/current-intent.test.ts",
    ph: 6,
    pkg: "6.2",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/profile/current-intent.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T021:db",
    pri: "P1",
    st: "M",
    layer: "Database",
    file: "supabase/tests/rls/availability.test.sql",
    ph: 6,
    pkg: "6.2",
    prod: "Q04",
    devCommand: "supabase test db supabase/tests/rls/availability.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T022:integration",
    pri: "P0",
    st: "P",
    layer: "Integration",
    file: "tests/integration/profile/completeness.test.ts",
    ph: 3,
    pkg: "3.3",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/profile/completeness.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T023:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/profile/visibility.test.ts",
    ph: 3,
    pkg: "3.3",
    prod: "Q06",
    devCommand:
      "npx vitest run --project integration tests/integration/profile/visibility.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T024:integration",
    pri: "P1",
    st: "P",
    layer: "Integration",
    file: "tests/integration/profile/games.test.ts",
    ph: 6,
    pkg: "6.2",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/profile/games.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T025:db",
    pri: "P0",
    st: "M",
    layer: "Database",
    file: "supabase/tests/rls/profile_matrix.test.sql",
    ph: 2,
    pkg: "2.3",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/profile_matrix.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T026:db",
    pri: "P1",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/catalog_seed.test.sql",
    ph: 6,
    pkg: "6.2",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/catalog_seed.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T027:e2e",
    pri: "P1",
    st: "R",
    layer: "E2E",
    file: "e2e/j01-onboarding.spec.ts",
    ph: 7,
    pkg: "7.1",
    prod: "D14",
    devCommand:
      "npx playwright test e2e/j01-onboarding.spec.ts --project=chromium",
    suiteCommand: "npm run test:e2e",
  },
  {
    key: "SL-T028:unit",
    pri: "P0",
    st: "E",
    layer: "Unit",
    file: "src/domains/discovery/eligibility.test.ts",
    ph: 3,
    pkg: "3.4",
    prod: "No",
    devCommand:
      "npx vitest run --project unit src/domains/discovery/eligibility.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T029:unit",
    pri: "P1",
    st: "M",
    layer: "Unit",
    file: "src/domains/discovery/cohort.test.ts",
    ph: 6,
    pkg: "6.3",
    prod: "No",
    devCommand:
      "npx vitest run --project unit src/domains/discovery/cohort.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T030:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/discovery/search.test.ts",
    ph: 3,
    pkg: "3.4",
    prod: "Q06",
    devCommand:
      "npx vitest run --project integration tests/integration/discovery/search.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T031:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/discovery/recommendations.test.ts",
    ph: 6,
    pkg: "6.3",
    prod: "Q05",
    devCommand:
      "npx vitest run --project integration tests/integration/discovery/recommendations.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T032:unit",
    pri: "P1",
    st: "M",
    layer: "Unit",
    file: "src/domains/discovery/recommend.test.ts",
    ph: 6,
    pkg: "6.3",
    prod: "No",
    devCommand:
      "npx vitest run --project unit src/domains/discovery/recommend.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T033:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/discovery/density.test.ts",
    ph: 6,
    pkg: "6.3",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/discovery/density.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T034:db",
    pri: "P1",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/discovery.test.sql",
    ph: 6,
    pkg: "6.3",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/discovery.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T035:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/discovery/pause.test.ts",
    ph: 6,
    pkg: "6.3",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/discovery/pause.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T036:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/discovery/filters.test.ts",
    ph: 6,
    pkg: "6.3",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/discovery/filters.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T037:e2e",
    pri: "P1",
    st: "E",
    layer: "E2E",
    file: "e2e/j06-cross-platform.spec.ts",
    ph: 7,
    pkg: "7.1",
    prod: "No",
    devCommand:
      "npx playwright test e2e/j06-cross-platform.spec.ts --project=chromium",
    suiteCommand: "npm run test:e2e",
  },
  {
    key: "SL-T038:component",
    pri: "P2",
    st: "M",
    layer: "Component",
    file: "src/components/discover/DiscoverFilterPanel.test.tsx",
    ph: 8,
    pkg: "8.1",
    prod: "No",
    devCommand:
      "npx vitest run --project component src/components/discover/DiscoverFilterPanel.test.tsx",
    suiteCommand: "npm run test:component",
  },
  {
    key: "SL-T039:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/connections/send.test.ts",
    ph: 4,
    pkg: "4.1",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/connections/send.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T040:db",
    pri: "P0",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/connections.test.sql",
    ph: 2,
    pkg: "2.4",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/connections.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T041:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/connections/transitions.test.ts",
    ph: 6,
    pkg: "6.4",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/connections/transitions.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T042:db",
    pri: "P0",
    st: "M",
    layer: "Database",
    file: "supabase/tests/security/block-propagation.test.sql",
    ph: 2,
    pkg: "2.4",
    prod: "Q12",
    devCommand:
      "supabase test db supabase/tests/security/block-propagation.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T043:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/connections/block.test.ts",
    ph: 6,
    pkg: "6.4",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/connections/block.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T044:unit",
    pri: "P1",
    st: "E",
    layer: "Unit",
    file: "src/domains/connections/schemas.test.ts",
    ph: 6,
    pkg: "6.4",
    prod: "No",
    devCommand:
      "npx vitest run --project unit src/domains/connections/schemas.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T045:e2e",
    pri: "P1",
    st: "M",
    layer: "E2E",
    file: "e2e/connections/connect.spec.ts",
    ph: 7,
    pkg: "7.1",
    prod: "D12",
    devCommand:
      "npx playwright test e2e/connections/connect.spec.ts --project=chromium",
    suiteCommand: "npm run test:e2e",
  },
  {
    key: "SL-T046:component",
    pri: "P1",
    st: "M",
    layer: "Component",
    file: "src/components/connections/ConnectionRequestCard.test.tsx",
    ph: 6,
    pkg: "6.9",
    prod: "No",
    devCommand:
      "npx vitest run --project component src/components/connections/ConnectionRequestCard.test.tsx",
    suiteCommand: "npm run test:component",
  },
  {
    key: "SL-T047:db",
    pri: "P0",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/connections.test.sql",
    ph: 2,
    pkg: "2.4",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/connections.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T048:integration",
    pri: "P2",
    st: "M",
    layer: "Integration",
    file: "tests/integration/connections/expiry.test.ts",
    ph: 8,
    pkg: "8.1",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/connections/expiry.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T049:db",
    pri: "P0",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/messages.test.sql",
    ph: 2,
    pkg: "2.5",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/messages.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T049:realtime",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/messaging/realtime-authz.test.ts",
    ph: 4,
    pkg: "4.2",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/messaging/realtime-authz.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T050:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/messaging/send.test.ts",
    ph: 4,
    pkg: "4.2",
    prod: "Q02/Q08",
    devCommand:
      "npx vitest run --project integration tests/integration/messaging/send.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T051:notification-db-failure",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/messaging/delivery-failure.test.ts",
    ph: 4,
    pkg: "4.2",
    prod: "D4/Q07",
    devCommand:
      "npx vitest run --project integration tests/integration/messaging/delivery-failure.test.ts -t notification-db-failure",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T051:email-postcommit-failure",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/messaging/delivery-failure.test.ts",
    ph: 4,
    pkg: "4.2",
    prod: "D4/Q07",
    devCommand:
      "npx vitest run --project integration tests/integration/messaging/delivery-failure.test.ts -t email-postcommit-failure",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T052:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/messaging/read-state.test.ts",
    ph: 6,
    pkg: "6.5",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/messaging/read-state.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T053:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/messaging/block.test.ts",
    ph: 4,
    pkg: "4.2",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/messaging/block.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T054:component",
    pri: "P1",
    st: "M",
    layer: "Component",
    file: "src/components/messaging/MessageComposer.test.tsx",
    ph: 6,
    pkg: "6.9",
    prod: "No",
    devCommand:
      "npx vitest run --project component src/components/messaging/MessageComposer.test.tsx",
    suiteCommand: "npm run test:component",
  },
  {
    key: "SL-T055:realtime-integ",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/messaging/realtime.test.ts",
    ph: 4,
    pkg: "4.2",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/messaging/realtime.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T055:hook-unmount",
    pri: "P0",
    st: "M",
    layer: "Component",
    file: "src/domains/messaging/useConversationRealtime.test.tsx",
    ph: 4,
    pkg: "4.2",
    prod: "No",
    devCommand:
      "npx vitest run --project component src/domains/messaging/useConversationRealtime.test.tsx",
    suiteCommand: "npm run test:component",
  },
  {
    key: "SL-T056:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/messaging/reconnect.test.ts",
    ph: 6,
    pkg: "6.5",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/messaging/reconnect.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T057:db",
    pri: "P1",
    st: "M",
    layer: "Database",
    file: "supabase/tests/retention/messages.test.sql",
    ph: 6,
    pkg: "6.5",
    prod: "No",
    devCommand: "supabase test db supabase/tests/retention/messages.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T058:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/notifications/service.test.ts",
    ph: 6,
    pkg: "6.5",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/notifications/service.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T059:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/notifications/preferences.test.ts",
    ph: 6,
    pkg: "6.5",
    prod: "Q09",
    devCommand:
      "npx vitest run --project integration tests/integration/notifications/preferences.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T060:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/email/client.test.ts",
    ph: 6,
    pkg: "6.5",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/email/client.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T061:e2e",
    pri: "P1",
    st: "P",
    layer: "E2E",
    file: "e2e/messaging/realtime-chat.spec.ts",
    ph: 7,
    pkg: "7.1",
    prod: "D12",
    devCommand:
      "npx playwright test e2e/messaging/realtime-chat.spec.ts --project=chromium",
    suiteCommand: "npm run test:e2e",
  },
  {
    key: "SL-T062:a11y",
    pri: "P2",
    st: "M",
    layer: "A11y",
    file: "e2e/a11y/messaging.spec.ts",
    ph: 8,
    pkg: "8.1",
    prod: "Q22",
    devCommand: "npx playwright test e2e/a11y/messaging.spec.ts --project=a11y",
    suiteCommand: "npm run test:a11y",
  },
  {
    key: "SL-T063:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/play/propose.test.ts",
    ph: 4,
    pkg: "4.3",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/play/propose.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T064:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/play/propose-atomicity.test.ts",
    ph: 4,
    pkg: "4.3",
    prod: "D5/Q10",
    devCommand:
      "npx vitest run --project integration tests/integration/play/propose-atomicity.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T065:db",
    pri: "P0",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/play_invitations.test.sql",
    ph: 2,
    pkg: "2.6",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/play_invitations.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T066:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/play/transitions.test.ts",
    ph: 6,
    pkg: "6.6",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/play/transitions.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T067:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/play/sessions.test.ts",
    ph: 4,
    pkg: "4.3",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/play/sessions.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T068:unit",
    pri: "P1",
    st: "E",
    layer: "Unit",
    file: "src/domains/play/timezone.test.ts",
    ph: 6,
    pkg: "6.6",
    prod: "No",
    devCommand:
      "npx vitest run --project unit src/domains/play/timezone.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T069:api",
    pri: "P1",
    st: "M",
    layer: "API",
    file: "tests/api/play-calendar.test.ts",
    ph: 6,
    pkg: "6.6",
    prod: "No",
    devCommand: "npx vitest run --project api tests/api/play-calendar.test.ts",
    suiteCommand: "npm run test:api",
  },
  {
    key: "SL-T070:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/play/feedback.test.ts",
    ph: 6,
    pkg: "6.6",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/play/feedback.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T071:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/jobs/play-reminders.test.ts",
    ph: 6,
    pkg: "6.8",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/jobs/play-reminders.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T072:e2e",
    pri: "P1",
    st: "P",
    layer: "E2E",
    file: "e2e/play/full-session.spec.ts",
    ph: 7,
    pkg: "7.1",
    prod: "D12",
    devCommand:
      "npx playwright test e2e/play/full-session.spec.ts --project=chromium",
    suiteCommand: "npm run test:e2e",
  },
  {
    key: "SL-T073:component",
    pri: "P2",
    st: "M",
    layer: "Component",
    file: "src/components/play/PlayInvitationCard.test.tsx",
    ph: 8,
    pkg: "8.1",
    prod: "No",
    devCommand:
      "npx vitest run --project component src/components/play/PlayInvitationCard.test.tsx",
    suiteCommand: "npm run test:component",
  },
  {
    key: "SL-T074:db",
    pri: "P0",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/teammate_relationships.test.sql",
    ph: 2,
    pkg: "2.6",
    prod: "No",
    devCommand:
      "supabase test db supabase/tests/rls/teammate_relationships.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T075:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/teammates/lifecycle.test.ts",
    ph: 6,
    pkg: "6.6",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/teammates/lifecycle.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T076:db",
    pri: "P0",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/teammate_relationships.test.sql",
    ph: 2,
    pkg: "2.6",
    prod: "No",
    devCommand:
      "supabase test db supabase/tests/rls/teammate_relationships.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T077:db",
    pri: "P0",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/private_groups.test.sql",
    ph: 2,
    pkg: "2.6",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/private_groups.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T078:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/groups/create.test.ts",
    ph: 4,
    pkg: "4.4",
    prod: "D7/Q11",
    devCommand:
      "npx vitest run --project integration tests/integration/groups/create.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T079:db",
    pri: "P0",
    st: "M",
    layer: "Database",
    file: "supabase/tests/rls/group-approval.test.sql",
    ph: 2,
    pkg: "2.6",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/group-approval.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T080:db",
    pri: "P0",
    st: "R",
    layer: "Database",
    file: "supabase/tests/rls/group_ownership.test.sql",
    ph: 2,
    pkg: "2.6",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/group_ownership.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T081:db",
    pri: "P0",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/group_messaging.test.sql",
    ph: 2,
    pkg: "2.6",
    prod: "Q12",
    devCommand: "supabase test db supabase/tests/rls/group_messaging.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T081:realtime",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/groups/realtime-authz.test.ts",
    ph: 4,
    pkg: "4.4",
    prod: "Q12",
    devCommand:
      "npx vitest run --project integration tests/integration/groups/realtime-authz.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T082:db",
    pri: "P1",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/group_open_seats.test.sql",
    ph: 6,
    pkg: "6.6",
    prod: "Q12",
    devCommand: "supabase test db supabase/tests/rls/group_open_seats.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T083:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/groups/conversation.test.ts",
    ph: 6,
    pkg: "6.6",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/groups/conversation.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T084:e2e",
    pri: "P1",
    st: "P",
    layer: "E2E",
    file: "e2e/groups/full-group.spec.ts",
    ph: 7,
    pkg: "7.1",
    prod: "Q12/D12",
    devCommand:
      "npx playwright test e2e/groups/full-group.spec.ts --project=chromium",
    suiteCommand: "npm run test:e2e",
  },
  {
    key: "SL-T085:a11y",
    pri: "P2",
    st: "M",
    layer: "A11y",
    file: "e2e/a11y/groups.spec.ts",
    ph: 8,
    pkg: "8.1",
    prod: "Q22",
    devCommand: "npx playwright test e2e/a11y/groups.spec.ts --project=a11y",
    suiteCommand: "npm run test:a11y",
  },
  {
    key: "SL-T086:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/moderation/report.test.ts",
    ph: 4,
    pkg: "4.5",
    prod: "D6/Q13/Q14",
    devCommand:
      "npx vitest run --project integration tests/integration/moderation/report.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T087:db",
    pri: "P0",
    st: "M",
    layer: "Database",
    file: "supabase/tests/security/report-context.test.sql",
    ph: 2,
    pkg: "2.7",
    prod: "No",
    devCommand:
      "supabase test db supabase/tests/security/report-context.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T088:integration",
    pri: "P0",
    st: "P",
    layer: "Integration",
    file: "tests/integration/moderation/block-report.test.ts",
    ph: 4,
    pkg: "4.5",
    prod: "Q03",
    devCommand:
      "npx vitest run --project integration tests/integration/moderation/block-report.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T089:unit",
    pri: "P1",
    st: "E",
    layer: "Unit",
    file: "src/domains/moderation/schemas.test.ts",
    ph: 6,
    pkg: "6.7",
    prod: "Q14",
    devCommand:
      "npx vitest run --project unit src/domains/moderation/schemas.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T090:integration",
    pri: "P0",
    st: "P",
    layer: "Integration",
    file: "tests/integration/admin/authorization.test.ts",
    ph: 4,
    pkg: "4.6",
    prod: "Q15",
    devCommand:
      "npx vitest run --project integration tests/integration/admin/authorization.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T091:db",
    pri: "P0",
    st: "M",
    layer: "Database",
    file: "supabase/tests/admin/case-actions.test.sql",
    ph: 2,
    pkg: "2.7",
    prod: "No",
    devCommand: "supabase test db supabase/tests/admin/case-actions.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T092:integration",
    pri: "P0",
    st: "P",
    layer: "Integration",
    file: "tests/integration/admin/evidence.test.ts",
    ph: 4,
    pkg: "4.6",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/admin/evidence.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T093:integration",
    pri: "P1",
    st: "P",
    layer: "Integration",
    file: "tests/integration/admin/appeals.test.ts",
    ph: 6,
    pkg: "6.7",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/admin/appeals.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T094:db",
    pri: "P1",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/moderation_release.test.sql",
    ph: 6,
    pkg: "6.7",
    prod: "No",
    devCommand:
      "supabase test db supabase/tests/rls/moderation_release.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T095:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/admin/feature-controls.test.ts",
    ph: 6,
    pkg: "6.7",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/admin/feature-controls.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T096:integration",
    pri: "P1",
    st: "P",
    layer: "Integration",
    file: "tests/integration/admin/catalog.test.ts",
    ph: 6,
    pkg: "6.7",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/admin/catalog.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T097:db",
    pri: "P0",
    st: "M",
    layer: "Database",
    file: "supabase/tests/privacy/export.test.sql",
    ph: 2,
    pkg: "2.7",
    prod: "No",
    devCommand: "supabase test db supabase/tests/privacy/export.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T098:db",
    pri: "P0",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/audit_events.test.sql",
    ph: 2,
    pkg: "2.2",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/audit_events.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T099:e2e",
    pri: "P1",
    st: "M",
    layer: "E2E",
    file: "e2e/moderation/full-case.spec.ts",
    ph: 7,
    pkg: "7.1",
    prod: "Q15",
    devCommand:
      "npx playwright test e2e/moderation/full-case.spec.ts --project=chromium",
    suiteCommand: "npm run test:e2e",
  },
  {
    key: "SL-T100:api",
    pri: "P0",
    st: "E",
    layer: "API",
    file: "tests/api/stripe-webhook.test.ts",
    ph: 4,
    pkg: "4.7",
    prod: "No",
    devCommand: "npx vitest run --project api tests/api/stripe-webhook.test.ts",
    suiteCommand: "npm run test:api:p0",
  },
  {
    key: "SL-T100:unit",
    pri: "P0",
    st: "E",
    layer: "Unit",
    file: "src/domains/billing/webhook.test.ts",
    ph: 4,
    pkg: "4.7",
    prod: "No",
    devCommand:
      "npx vitest run --project unit src/domains/billing/webhook.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T101:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/billing/webhooks.test.ts",
    ph: 4,
    pkg: "4.7",
    prod: "Q19",
    devCommand:
      "npx vitest run --project integration tests/integration/billing/webhooks.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T102:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/billing/webhook-order.test.ts",
    ph: 4,
    pkg: "4.7",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/billing/webhook-order.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T103:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/billing/resubscribe.test.ts",
    ph: 4,
    pkg: "4.7",
    prod: "D3/Q17",
    devCommand:
      "npx vitest run --project integration tests/integration/billing/resubscribe.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T104:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/billing/actions.test.ts",
    ph: 4,
    pkg: "4.7",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/billing/actions.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T105:db",
    pri: "P1",
    st: "E",
    layer: "Database",
    file: "supabase/tests/rls/saved_searches.test.sql",
    ph: 6,
    pkg: "6.7",
    prod: "No",
    devCommand: "supabase test db supabase/tests/rls/saved_searches.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T106:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/billing/entitlements.test.ts",
    ph: 6,
    pkg: "6.7",
    prod: "Q18",
    devCommand:
      "npx vitest run --project integration tests/integration/billing/entitlements.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T107:integration",
    pri: "P0",
    st: "M",
    layer: "Integration",
    file: "tests/integration/billing/deletion.test.ts",
    ph: 4,
    pkg: "4.7",
    prod: "D2/Q16",
    devCommand:
      "npx vitest run --project integration tests/integration/billing/deletion.test.ts",
    suiteCommand: "npm run test:integration:p0",
  },
  {
    key: "SL-T108:e2e-local-stub",
    pri: "P1",
    st: "P",
    layer: "E2E",
    file: "e2e/billing/lifecycle.spec.ts",
    ph: 7,
    pkg: "7.1",
    prod: "No",
    devCommand:
      "npx playwright test e2e/billing/lifecycle.spec.ts --project=chromium",
    suiteCommand: "npm run test:e2e",
  },
  {
    key: "SL-T108:e2e-stripe-staging",
    pri: "P1",
    st: "M",
    layer: "E2E",
    file: "e2e/billing/lifecycle.staging.spec.ts",
    ph: 7,
    pkg: "7.2",
    prod: "No",
    devCommand: "npm run test:e2e:stripe-staging",
    suiteCommand: "npm run test:e2e:stripe-staging",
  },
  {
    key: "SL-T109:db",
    pri: "P0",
    st: "P",
    layer: "Database",
    file: "supabase/tests/security/all-tables-rls.test.sql",
    ph: 2,
    pkg: "2.1",
    prod: "No",
    devCommand:
      "supabase test db supabase/tests/security/all-tables-rls.test.sql",
    suiteCommand: "npm run test:db",
  },
  {
    key: "SL-T110:api",
    pri: "P0",
    st: "M",
    layer: "API",
    file: "tests/api/cron-auth.test.ts",
    ph: 4,
    pkg: "4.8",
    prod: "D1/Q21",
    devCommand: "npx vitest run --project api tests/api/cron-auth.test.ts",
    suiteCommand: "npm run test:api:p0",
  },
  {
    key: "SL-T111:integration",
    pri: "P1",
    st: "M",
    layer: "Integration",
    file: "tests/integration/jobs/idempotency.test.ts",
    ph: 6,
    pkg: "6.8",
    prod: "No",
    devCommand:
      "npx vitest run --project integration tests/integration/jobs/idempotency.test.ts",
    suiteCommand: "npm run test:integration",
  },
  {
    key: "SL-T112:api",
    pri: "P1",
    st: "M",
    layer: "API",
    file: "tests/api/health.test.ts",
    ph: 6,
    pkg: "6.8",
    prod: "D8/Q20",
    devCommand: "npx vitest run --project api tests/api/health.test.ts",
    suiteCommand: "npm run test:api",
  },
  {
    key: "SL-T113:unit-decision",
    pri: "P1",
    st: "P",
    layer: "Unit",
    file: "tests/unit/scripts/smoke-post-deploy.test.ts",
    ph: 6,
    pkg: "6.8",
    prod: "D8/Q20",
    devCommand:
      "npx vitest run --project unit tests/unit/scripts/smoke-post-deploy.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T113:live-staging",
    pri: "P1",
    st: "P",
    layer: "Smoke",
    file: "scripts/smoke-post-deploy.ts",
    ph: 7,
    pkg: "7.3",
    prod: "D8/Q20",
    devCommand: "BASE_URL=$STAGING_URL npm run smoke:post-deploy",
    suiteCommand: "post-deploy job (blocks promotion)",
  },
  {
    key: "SL-T114:unit",
    pri: "P0",
    st: "M",
    layer: "Unit",
    file: "src/lib/sentry.test.ts",
    ph: 3,
    pkg: "3.5",
    prod: "D9",
    devCommand: "npx vitest run --project unit src/lib/sentry.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T115:unit",
    pri: "P0",
    st: "P",
    layer: "Unit",
    file: "src/lib/analytics/events.test.ts",
    ph: 3,
    pkg: "3.5",
    prod: "D10",
    devCommand:
      "npx vitest run --project unit src/lib/analytics/events.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T116:a11y",
    pri: "P1",
    st: "E",
    layer: "A11y",
    file: "e2e/a11y/journey-routes.spec.ts",
    ph: 7,
    pkg: "7.1",
    prod: "Q22/D15",
    devCommand: "npx playwright test e2e/a11y --project=a11y",
    suiteCommand: "npm run test:a11y",
  },
  {
    key: "SL-T117:a11y",
    pri: "P1",
    st: "M",
    layer: "A11y",
    file: "e2e/a11y/keyboard.spec.ts",
    ph: 7,
    pkg: "7.1",
    prod: "Q22",
    devCommand: "npx playwright test e2e/a11y/keyboard.spec.ts --project=a11y",
    suiteCommand: "npm run test:a11y",
  },
  {
    key: "SL-T118:e2e",
    pri: "P1",
    st: "M",
    layer: "E2E",
    file: "e2e/responsive/core.spec.ts",
    ph: 7,
    pkg: "7.1",
    prod: "No",
    devCommand:
      "npx playwright test e2e/responsive/core.spec.ts --project=chromium",
    suiteCommand: "npm run test:e2e",
  },
  {
    key: "SL-T119:unit-env",
    pri: "P1",
    st: "E",
    layer: "Unit",
    file: "src/lib/env.test.ts",
    ph: 6,
    pkg: "6.8",
    prod: "D13/Q21",
    devCommand: "npx vitest run --project unit src/lib/env.test.ts",
    suiteCommand: "npm run test:unit",
  },
  {
    key: "SL-T119:ci-env-gate",
    pri: "P1",
    st: "M",
    layer: "CI",
    file: ".github/workflows/ci.yml",
    ph: 6,
    pkg: "6.8",
    prod: "D13",
    devCommand: "gh run / job logs",
    suiteCommand: "required check env-production-gate",
  },
  {
    key: "SL-T120:load",
    pri: "P2",
    st: "P",
    layer: "Perf",
    file: "scripts/load/messaging-realtime.k6.ts",
    ph: 8,
    pkg: "8.2",
    prod: "No",
    devCommand: "npm run test:load:realtime",
    suiteCommand: "nightly/release",
  },
];

function stToBaseline(st: St): string {
  return { M: "missing", P: "partial", E: "exists-expand", R: "rewrite" }[st];
}

function layerToKey(layer: string): string {
  const map: Record<string, string> = {
    E2E: "e2e",
    Unit: "unit",
    Integration: "integration",
    Database: "database",
    API: "api",
    Component: "component",
    A11y: "a11y",
    CI: "ci",
    Smoke: "smoke",
    Perf: "perf",
  };
  return map[layer] ?? layer.toLowerCase();
}

function parseProd(prod: string): {
  decisions: string[];
  defects: string[];
  contractRef: string | null;
} {
  if (prod === "No") return { decisions: [], defects: [], contractRef: null };
  const decisions: string[] = [];
  const defects: string[] = [];
  for (const part of prod.split("/")) {
    if (part.startsWith("Q")) decisions.push(part);
    else if (part.startsWith("D")) defects.push(part);
  }
  let contractRef: string | null = null;
  if (decisions.includes("Q06"))
    contractRef = "docs/testing/contracts/package-e.json";
  if (decisions.includes("Q12"))
    contractRef = "docs/testing/contracts/package-e.json";
  if (decisions.includes("Q19"))
    contractRef = "docs/testing/contracts/package-d.json";
  return { decisions, defects, contractRef };
}

function titleMarker(row: Row): string {
  const id = row.key.split(":")[0];
  const suffix = row.key.split(":").slice(1).join(":");
  const pri = row.pri.toLowerCase();
  if (row.layer === "Database") return `-- ${row.key} @${pri}`;
  if (row.layer === "CI" || row.layer === "Smoke" || row.layer === "Perf")
    return `${row.key} @${pri}`;
  return `[${id}][${suffix}] @${pri}`;
}

function reqIdFromKey(key: string): string {
  return key.split(":")[0];
}

function canonicalHeadingId(id: string): string {
  return id.toLowerCase().replace(/-/g, "-");
}

function buildInventory() {
  const byReq = new Map<string, Row[]>();
  for (const row of MATRIX) {
    const id = reqIdFromKey(row.key);
    if (!byReq.has(id)) byReq.set(id, []);
    byReq.get(id)!.push(row);
  }

  const requirements = Array.from({ length: 120 }, (_, i) => {
    const id = `SL-T${String(i + 1).padStart(3, "0")}`;
    const rows = byReq.get(id) ?? [];
    if (rows.length === 0) throw new Error(`Missing matrix rows for ${id}`);
    const priority = rows[0].pri;
    return {
      id,
      priority,
      canonicalHeadingId: canonicalHeadingId(id),
      implementations: rows.map((row) => {
        const { decisions, defects, contractRef } = parseProd(row.prod);
        return {
          key: row.key,
          layer: layerToKey(row.layer),
          file: row.file,
          phase: row.ph,
          package: row.pkg,
          baselineStatus: stToBaseline(row.st),
          implementationStatus: "missing",
          disposition: "required",
          deferredRecord: null,
          decisions,
          defects,
          coShipsWith: null,
          contractRef,
          setupRef: `docs/testing/canonical-anchors.md#${canonicalHeadingId(id)}-setup`,
          stepsRef: `docs/testing/canonical-anchors.md#${canonicalHeadingId(id)}-steps`,
          expectedRef: `docs/testing/canonical-anchors.md#${canonicalHeadingId(id)}-expected`,
          titleMarker: titleMarker(row),
          owner: "test-implementation-lead",
          devCommand: row.devCommand,
          suiteCommand: row.suiteCommand,
          acceptanceCommand: row.suiteCommand,
        };
      }),
    };
  });

  return { schemaVersion: 2, baselineSha: BASELINE_SHA, requirements };
}

function buildCanonicalAnchors(): string {
  const lines = [
    "# Canonical test anchors",
    "",
    "> Planning stubs — flesh out during implementation.",
    "",
  ];
  for (let i = 1; i <= 120; i++) {
    const id = `SL-T${String(i).padStart(3, "0")}`;
    const hid = id.toLowerCase();
    lines.push(`## ${id}`, "");
    lines.push(`<a id="${hid}"></a>`, "");
    lines.push(
      `<a id="${hid}-setup"></a>`,
      "### Setup",
      "TBD — define fixtures, actors, and environment.",
      "",
    );
    lines.push(
      `<a id="${hid}-steps"></a>`,
      "### Steps",
      "TBD — define actionable test steps.",
      "",
    );
    lines.push(
      `<a id="${hid}-expected"></a>`,
      "### Expected",
      "TBD — define observable pass criteria.",
      "",
    );
  }
  return lines.join("\n");
}

const GEN_HEADER = "Generated from tests/test-inventory.json — do not edit";

function buildMatrixMd(inv: ReturnType<typeof buildInventory>): string {
  const lines = [
    `${GEN_HEADER}\n`,
    "# Implementation matrix",
    "",
    "| Key | Priority | Layer | File | Phase | Package | Baseline |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const req of inv.requirements) {
    for (const impl of req.implementations) {
      lines.push(
        `| ${impl.key} | ${req.priority} | ${impl.layer} | \`${impl.file}\` | ${impl.phase} | ${impl.package} | ${impl.baselineStatus} |`,
      );
    }
  }
  return lines.join("\n") + "\n";
}

function buildCountsMd(inv: ReturnType<typeof buildInventory>): string {
  const reqByPri: Record<string, number> = {};
  const implByPri: Record<string, number> = {};
  let totalImpl = 0;
  for (const req of inv.requirements) {
    reqByPri[req.priority] = (reqByPri[req.priority] ?? 0) + 1;
    implByPri[req.priority] =
      (implByPri[req.priority] ?? 0) + req.implementations.length;
    totalImpl += req.implementations.length;
  }
  return (
    [
      `${GEN_HEADER}\n`,
      "# Inventory counts",
      "",
      "| Priority | Requirements | Implementations |",
      "|---|---:|---:|",
      ...["P0", "P1", "P2"].map(
        (p) => `| ${p} | ${reqByPri[p] ?? 0} | ${implByPri[p] ?? 0} |`,
      ),
      "",
      `| **Total** | **${inv.requirements.length}** | **${totalImpl}** |`,
      "",
    ].join("\n") + "\n"
  );
}

function buildPhaseMd(
  inv: ReturnType<typeof buildInventory>,
  phase: number,
): string {
  const lines = [
    `${GEN_HEADER}\n`,
    `# Phase ${phase} implementations`,
    "",
    "| Key | Priority | Layer | File | Package |",
    "|---|---|---|---|---|",
  ];
  for (const req of inv.requirements) {
    for (const impl of req.implementations) {
      if (impl.phase === phase) {
        lines.push(
          `| ${impl.key} | ${req.priority} | ${impl.layer} | \`${impl.file}\` | ${impl.package} |`,
        );
      }
    }
  }
  return lines.join("\n") + "\n";
}

function writeGenerated(inv: ReturnType<typeof buildInventory>) {
  const genDir = join(ROOT, "docs/testing/generated");
  mkdirSync(genDir, { recursive: true });
  writeFileSync(join(genDir, "matrix.md"), buildMatrixMd(inv));
  writeFileSync(join(genDir, "counts.md"), buildCountsMd(inv));
  for (let ph = 2; ph <= 8; ph++) {
    writeFileSync(join(genDir, `phase-${ph}.md`), buildPhaseMd(inv, ph));
  }
}

function main() {
  const inv = buildInventory();
  mkdirSync(join(ROOT, "tests"), { recursive: true });
  mkdirSync(join(ROOT, "docs/testing"), { recursive: true });
  writeFileSync(
    join(ROOT, "tests/test-inventory.json"),
    JSON.stringify(inv, null, 2) + "\n",
  );
  writeFileSync(
    join(ROOT, "docs/testing/canonical-anchors.md"),
    buildCanonicalAnchors(),
  );
  writeGenerated(inv);
  console.log(
    `Generated inventory: ${inv.requirements.length} requirements, ${MATRIX.length} implementations`,
  );
}

main();
