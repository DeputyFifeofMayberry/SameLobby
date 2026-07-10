/**
 * One-shot Phase 8 close: mark P2 implementations complete and fill canonical anchors.
 * Run: npx tsx scripts/close-phase8.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const INVENTORY_PATH = join(ROOT, "tests/test-inventory.json");
const ANCHORS_PATH = join(ROOT, "docs/testing/canonical-anchors.md");

const PHASE8_IDS = new Set([
  "SL-T038",
  "SL-T048",
  "SL-T062",
  "SL-T073",
  "SL-T085",
  "SL-T120",
]);

type AnchorSections = { setup: string; steps: string; expected: string };

const ANCHORS: Record<string, AnchorSections> = {
  "SL-T038": {
    setup:
      "Vitest component project; mocked `listGames`, `listPlatforms`, and Next router/link.",
    steps:
      "Await async `DiscoverFilterPanel` render; assert heading, Game/Platform/Goal labels, and advanced search link.",
    expected:
      "Filter panel exposes search players heading, filter controls, and link to `/discover/search`.",
  },
  "SL-T048": {
    setup:
      "Two active users; `connection_requests_enabled` on; pending request inserted then backdated.",
    steps:
      "1. Send pending connection request.\n2. Sender backdates `expires_at`.\n3. Recipient calls `accept_connection_request` RPC.",
    expected:
      "Accept RPC returns null without error; request row status becomes `expired`; no connection created.",
  },
  "SL-T062": {
    setup:
      "Playwright a11y project; active seed user signed in; Q22 serious/critical gate.",
    steps: "Navigate to `/messages` and run axe wcag2a/2aa/21aa/22aa scan.",
    expected: "Messages list route has zero serious/critical accessibility violations.",
  },
  "SL-T073": {
    setup: "Vitest component project; sample `PlayInvitationListItem` fixture.",
    steps:
      "Render `PlayInvitationCard` with incoming proposed invitation; assert profile link, status line, game/platform, and detail link.",
    expected:
      "Card shows peer profile link, direction/status, game/platform summary, and invitation detail href.",
  },
  "SL-T085": {
    setup:
      "Playwright a11y project; cleared owned groups; active user signed in; `private_groups_enabled` on.",
    steps: "Navigate to `/groups/new` and run axe wcag2a/2aa/21aa/22aa scan.",
    expected: "New group form route has zero serious/critical accessibility violations.",
  },
  "SL-T120": {
    setup:
      "k6 with staging/local env: BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD.",
    steps:
      "Run `npm run test:load:realtime` ramping 100 VUs with 5m steady state; subscribe to realtime messages channel.",
    expected:
      "delivery rate >99%, join p95 <2s, join error <1%, zero duplicate message IDs, zero unauthorized joins (plan §N).",
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
    if (!PHASE8_IDS.has(req.id)) continue;
    for (const impl of req.implementations) {
      if (impl.phase === 8) {
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

  console.log(`Phase 8 close: marked ${marked} implementations complete`);
  console.log(
    `Updated ${anchorUpdates} canonical anchor sections (${Object.keys(ANCHORS).length} requirements targeted)`,
  );
}

main();
