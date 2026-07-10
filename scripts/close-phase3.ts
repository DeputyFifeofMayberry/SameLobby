/**
 * One-shot Phase 3 close: mark app-layer P0 implementations complete and fill canonical anchors.
 * Run: npx tsx scripts/close-phase3.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const INVENTORY_PATH = join(ROOT, "tests/test-inventory.json");
const ANCHORS_PATH = join(ROOT, "docs/testing/canonical-anchors.md");

const PHASE3_IDS = new Set([
  "SL-T001",
  "SL-T002",
  "SL-T003",
  "SL-T006",
  "SL-T007",
  "SL-T010",
  "SL-T011",
  "SL-T013",
  "SL-T016",
  "SL-T017",
  "SL-T022",
  "SL-T023",
  "SL-T028",
  "SL-T030",
  "SL-T114",
  "SL-T115",
]);

type AnchorSections = { setup: string; steps: string; expected: string };

const ANCHORS: Record<string, AnchorSections> = {
  "SL-T001": {
    setup:
      "Playwright chromium-p0 project; unauthenticated browser context and SEED_USERS.active fixture.",
    steps:
      "1. Visit `/discover`, `/messages`, and `/profile` without session.\n2. Sign in active seed user via password API (D14).\n3. Visit `/discover`.",
    expected:
      "Unauthenticated visits redirect to `/sign-in?next=…`; authenticated active user reaches `/discover` with heading visible.",
  },
  "SL-T002": {
    setup: "Vitest unit project; account and profile fixture objects.",
    steps:
      "Exercise `getAccountRouteRedirect` and `resolvePostAuthRedirect` across onboarding, active, incomplete, deletion_pending, suspended/restricted/deleted, attestation, and billing self-service paths.",
    expected:
      "Route guard returns safe destinations per account status and profile completeness; unsafe `next` paths rejected.",
  },
  "SL-T003": {
    setup:
      "Local Supabase; `registration_open` feature flag toggled; anon auth client for sign-up.",
    steps:
      "1. Sign up with registration open.\n2. Sign up with registration closed.\n3. pgTAP: set `registration_cap` at boundary and insert auth users.",
    expected:
      "Open sign-up provisions onboarding account at identity step; closed sign-up returns error with no account row; cap SQL rejects overflow insert.",
  },
  "SL-T006": {
    setup: "Provisioned active user; anon and actor Supabase clients.",
    steps:
      "1. Password API sign-in with valid credentials.\n2. Attempt wrong password and missing email.\n3. Anonymous actor queries accounts.",
    expected:
      "Valid sign-in returns session and RLS read of own account; invalid credentials throw without exposing rows.",
  },
  "SL-T007": {
    setup: "Vitest api project with mocked Supabase server client and account/profile queries.",
    steps:
      "Hit `GET /auth/callback` for bad code, recovery type, successful sign-in with safe `next`, unsafe external `next`, and onboarding user.",
    expected:
      "Bad code → sign-in error; recovery → reset-password; safe next honored; external next → `/discover`; onboarding → attestation.",
  },
  "SL-T010": {
    setup: "Playwright with password API auth (D14); active seed user.",
    steps:
      "1. Sign in and visit `/discover`.\n2. Clear cookies.\n3. Visit `/messages`.",
    expected:
      "Cleared cookies require sign-in again with `next` param preserved.",
  },
  "SL-T011": {
    setup: "Provisioned onboarding user; service-role admin client.",
    steps:
      "1. Call `complete_account_attestation` RPC.\n2. Sign in actor and read account.\n3. Count `consent_events`.",
    expected:
      "Account becomes `active` with attestation timestamps; actor reads own row; four consent events recorded.",
  },
  "SL-T013": {
    setup: "Provisioned active user.",
    steps:
      "1. Call `request_account_deletion` RPC.\n2. Actor reads account status.\n3. Repeat RPC; count deletion_requests rows.",
    expected:
      "Account `deletion_pending`; request status `requested`; second call is idempotent (single request row).",
  },
  "SL-T016": {
    setup: "Active user with incomplete profile defaults.",
    steps:
      "Load account/profile and call `getAccountRouteRedirect` for `/discover`; run completeness helpers.",
    expected:
      "Incomplete profile redirects to `/onboarding/identity`; completeness helpers report errors.",
  },
  "SL-T017": {
    setup: "Two active users for duplicate-name scenario; actor sessions via password API.",
    steps:
      "1. Save display name + time zone via actor updates.\n2. Attempt taken display name.\n3. Simulate split profile/account writes (D11).",
    expected:
      "Happy path persists both fields; duplicate name fails without adopting name; split-write path remains recoverable when account update follows profile save.",
  },
  "SL-T022": {
    setup: "Profile completeness fixture objects (no DB).",
    steps:
      "Call `isProfileComplete` and `profileCompletenessErrors` with missing fields, shortcut via `onboarding_completed_at`, and all-minimum pass.",
    expected:
      "Incomplete profiles fail with specific errors; completed shortcut passes; full minimum field set passes.",
  },
  "SL-T023": {
    setup: "Owner and outsider active accounts with default disclosure settings.",
    steps:
      "1. Assert three default disclosure rows.\n2. Owner reads own settings.\n3. Outsider reads owner settings and gamer_profiles.",
    expected:
      "Defaults match migration matrix; owner reads three rows; outsider sees zero disclosure and profile rows (Package E / Q06).",
  },
  "SL-T028": {
    setup: "Synthetic `DiscoveryCandidate` fixtures.",
    steps:
      "Run `checkEligibility`, `canPlayOnSharedGame`, and `buildReasonCodes` for self, blocked, no-shared-game, crossplay, and stable reason ordering.",
    expected:
      "Self and blocked rejected; shared game + goal required; crossplay accepted; reason codes stable and include shared signals.",
  },
  "SL-T030": {
    setup:
      "Two discoverable users with fortnite/pc catalog; `discovery_enabled` flag true.",
    steps:
      "1. Admin query discoverable profiles by display name.\n2. Insert block; run `checkEligibility` with blocked pair.",
    expected:
      "Target appears in discoverable query; blocked pair returns `{ eligible: false, reason: 'blocked' }`.",
  },
  "SL-T114": {
    setup: "Vitest unit project; Sentry helpers with env stubs.",
    steps:
      "Exercise `scrubValue` on sensitive keys, `captureException` dev stub, and document D9 nested scrub gap.",
    expected:
      "Top-level sensitive keys redacted; dev capture is no-op; nested scrub limitation characterized (D9).",
  },
  "SL-T115": {
    setup: "Vitest unit project; analytics event tracker.",
    steps:
      "Track allowlisted events, reject unknown events, verify replay-off posture (D10 property scrub gap documented).",
    expected:
      "Allowlisted events succeed; unknown events throw; sensitive property scrub gap characterized (D10).",
  },
};

function patchAnchors(markdown: string): string {
  let out = markdown;
  for (const [id, sections] of Object.entries(ANCHORS)) {
    const hid = id.toLowerCase();
    for (const [suffix, content] of Object.entries({
      setup: sections.setup,
      steps: sections.steps,
      expected: sections.expected,
    })) {
      const heading =
        suffix === "setup" ? "Setup" : suffix === "steps" ? "Steps" : "Expected";
      const anchorId = `${hid}-${suffix}`;
      const re = new RegExp(
        `(id="${anchorId}"></a>\\s*\\n\\s*### ${heading}\\s*\\n\\s*)TBD —[^\\n]*\\n`,
        "i",
      );
      if (!re.test(out)) {
        throw new Error(`anchor block not found for ${anchorId}`);
      }
      out = out.replace(re, `$1${content}\n\n`);
    }
  }
  return out;
}

function main() {
  const inv = JSON.parse(readFileSync(INVENTORY_PATH, "utf8")) as {
    requirements: {
      id: string;
      implementations: { key: string; phase: number; implementationStatus: string }[];
    }[];
  };

  let marked = 0;
  for (const req of inv.requirements) {
    if (!PHASE3_IDS.has(req.id)) continue;
    for (const impl of req.implementations) {
      if (impl.phase === 3) {
        impl.implementationStatus = "complete";
        marked++;
      }
    }
  }

  writeFileSync(INVENTORY_PATH, `${JSON.stringify(inv, null, 2)}\n`, "utf8");

  const anchors = patchAnchors(readFileSync(ANCHORS_PATH, "utf8"));
  writeFileSync(ANCHORS_PATH, anchors, "utf8");

  console.log(`Phase 3 close: marked ${marked} implementations complete`);
  console.log(`Updated canonical anchors for ${Object.keys(ANCHORS).length} requirements`);
}

main();
