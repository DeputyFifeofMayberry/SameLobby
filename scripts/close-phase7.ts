/**
 * One-shot Phase 7 close: mark E2E/a11y/smoke P1 implementations complete and fill canonical anchors.
 * Run: npx tsx scripts/close-phase7.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const INVENTORY_PATH = join(ROOT, "tests/test-inventory.json");
const ANCHORS_PATH = join(ROOT, "docs/testing/canonical-anchors.md");

const PHASE7_IDS = new Set([
  "SL-T027",
  "SL-T037",
  "SL-T045",
  "SL-T061",
  "SL-T072",
  "SL-T084",
  "SL-T099",
  "SL-T108",
  "SL-T113",
  "SL-T116",
  "SL-T117",
  "SL-T118",
]);

type AnchorSections = { setup: string; steps: string; expected: string };

const ANCHORS: Record<string, AnchorSections> = {
  "SL-T027": {
    setup:
      "Playwright chromium; SEED_USERS.onboarding and active fixtures; `signInThroughUi` for D14 onboarding path.",
    steps:
      "1. Sign in onboarding user through UI; assert attestation form with required legal checkboxes.\n2. Active fixture visits `/discover` and `/profile` with completed minimum profile.",
    expected:
      "Onboarding user lands on attestation with required fields; active user sees discover heading and profile game/communication details.",
  },
  "SL-T037": {
    setup: "Playwright chromium; active seed user with PeerOne discoverable on Fortnite/PC.",
    steps:
      "1. Open `/discover/search`.\n2. Filter Game=Fortnite, Platform=PC; run search.\n3. Open PeerOne profile from results.",
    expected:
      "URL reflects game/platform filters; PeerOne card shows shared game; profile displays Fortnite and PC.",
  },
  "SL-T045": {
    setup:
      "Two browser contexts; password API sign-in (D14) for dev-active and dev-peer-1 seed users.",
    steps:
      "1. Both users open messages and confirm connection visible.\n2. Sender opens PeerOne thread, sends unique message.\n3. Recipient opens thread and reads message.",
    expected:
      "Connected pair appears in messages list; sent message delivered and visible to recipient.",
  },
  "SL-T061": {
    setup:
      "Two browser contexts; password API sign-in for dev-active and dev-peer-1; unique message namespace.",
    steps:
      "1. User A sends message in shared conversation.\n2. User B opens thread, sees message, replies.\n3. User A reloads and sees reply.",
    expected:
      "Bidirectional chat works; messages persist across reload (realtime/poll characterized per D12).",
  },
  "SL-T072": {
    setup:
      "Two browser contexts; cleared open invitations; password API sign-in for proposer and recipient.",
    steps:
      "1. Proposer sends play invitation from conversation.\n2. Recipient accepts from `/play` open invitations.\n3. Proposer views confirmed session.",
    expected:
      "Invitation moves proposed → accepted; both parties see confirmed play session.",
  },
  "SL-T084": {
    setup:
      "Active user with PeerOne connection; cleared owned groups; `private_groups_enabled` via seed.",
    steps:
      "1. Create group at `/groups/new` with PeerOne invite.\n2. Assert group URL, member count, and pending invitation UI.",
    expected:
      "Group created in forming state with 1/4 members and PeerOne pending invitation (Q12 group chat characterized separately).",
  },
  "SL-T099": {
    setup: "Playwright chromium; active seed user (Q15: full admin MFA flow deferred).",
    steps: "Navigate to `/settings/safety` as active user.",
    expected:
      "Safety settings heading visible; full report→admin→appeal journey covered by integration/pgTAP until AAL2 Playwright fixture exists.",
  },
  "SL-T108": {
    setup:
      "Local stub: `stripe_enabled` flag on; active user; read-only toggle harness. Staging: `STAGING_BASE_URL` set.",
    steps:
      "1. Local: visit `/subscription`, assert upgrade CTA; toggle read-only and assert lapse messaging.\n2. Staging: open subscription page (checkout wiring fixme until credentials approved).",
    expected:
      "Local stub shows billing management and read-only messaging; staging spec skips without STAGING_BASE_URL and documents Stripe lifecycle gap.",
  },
  "SL-T113": {
    setup:
      "Unit-decision: Vitest reads script source. Live-staging: deployed BASE_URL with health and public routes reachable.",
    steps:
      "1. Unit: assert `/api/health` check and Q20 degraded characterization.\n2. Live: run `npm run smoke:post-deploy` against staging BASE_URL.",
    expected:
      "Script checks health (200), sign-in, and sign-up reachability; live-staging job blocks promotion on failure.",
  },
  "SL-T116": {
    setup:
      "Playwright a11y project; axe wcag2a/2aa/21aa/22aa tags; public, onboarding, and active-user journey routes.",
    steps:
      "Scan each route in PUBLIC_ROUTES, onboarding attestation, and authenticated JOURNEY_ROUTES for serious/critical violations.",
    expected:
      "Zero serious/critical axe violations per Q22 open default on all listed journey routes.",
  },
  "SL-T117": {
    setup: "Playwright a11y project; keyboard-only interaction on sign-in and discover search.",
    steps:
      "1. Tab through sign-in form, submit with Enter.\n2. Signed-in user focuses discover search/filter controls.",
    expected:
      "Sign-in operable via keyboard; discover search maintains focus semantics after opening filters.",
  },
  "SL-T118": {
    setup: "Playwright chromium; active seed user; mobile viewport sizes 320px, 412px, and landscape.",
    steps:
      "Visit `/discover`, `/messages`, `/profile`, `/play` at 320px; repeat discover at Pixel 7 size; profile in landscape mobile.",
    expected:
      "Core route headings visible; no horizontal body scroll at 320px; layouts usable on mobile viewports.",
  },
};

function patchAnchors(markdown: string): { markdown: string; updates: number } {
  let out = markdown;
  let updates = 0;
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
        continue;
      }
      out = out.replace(re, `$1${content}\n\n`);
      updates++;
    }
  }
  return { markdown: out, updates };
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
    if (!PHASE7_IDS.has(req.id)) continue;
    for (const impl of req.implementations) {
      if (impl.phase === 7) {
        impl.implementationStatus = "complete";
        marked++;
      }
    }
  }

  writeFileSync(INVENTORY_PATH, `${JSON.stringify(inv, null, 2)}\n`, "utf8");

  const { markdown: anchors, updates: anchorUpdates } = patchAnchors(
    readFileSync(ANCHORS_PATH, "utf8"),
  );
  writeFileSync(ANCHORS_PATH, anchors, "utf8");

  console.log(`Phase 7 close: marked ${marked} implementations complete`);
  console.log(
    `Updated ${anchorUpdates} canonical anchor sections (${Object.keys(ANCHORS).length} requirements targeted)`,
  );
}

main();
