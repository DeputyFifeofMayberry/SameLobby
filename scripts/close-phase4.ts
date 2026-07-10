/**
 * One-shot Phase 4 close: mark domain P0 implementations complete and fill canonical anchors.
 * Run: npx tsx scripts/close-phase4.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const INVENTORY_PATH = join(ROOT, "tests/test-inventory.json");
const ANCHORS_PATH = join(ROOT, "docs/testing/canonical-anchors.md");

const PHASE4_IDS = new Set([
  "SL-T014",
  "SL-T039",
  "SL-T049",
  "SL-T050",
  "SL-T051",
  "SL-T053",
  "SL-T055",
  "SL-T063",
  "SL-T064",
  "SL-T067",
  "SL-T078",
  "SL-T081",
  "SL-T086",
  "SL-T088",
  "SL-T090",
  "SL-T092",
  "SL-T100",
  "SL-T101",
  "SL-T102",
  "SL-T103",
  "SL-T104",
  "SL-T107",
  "SL-T110",
]);

type AnchorSections = { setup: string; steps: string; expected: string };

const ANCHORS: Record<string, AnchorSections> = {
  "SL-T014": {
    setup: "Active user with deletion request; password re-auth fixture.",
    steps:
      "Invoke deletion confirmation server action with correct password after `request_account_deletion`.",
    expected:
      "Deletion request confirmed per Q16; account remains `deletion_pending` until pipeline runs (D2 characterized).",
  },
  "SL-T039": {
    setup: "Two active users with completed profiles; `connection_requests_enabled` flag on.",
    steps:
      "1. Sender inserts pending request.\n2. Verify sender and recipient visibility.\n3. Attempt duplicate pending request.",
    expected:
      "Pending request visible to both parties; duplicate insert rejected.",
  },
  "SL-T049": {
    setup: "Connected pair with conversation; third non-member account.",
    steps:
      "1. pgTAP: member sends message; non-member denied; block hides conversation.\n2. Realtime: non-member subscribes to conversation messages channel.",
    expected:
      "RLS denies non-member reads; blocking prevents sends; realtime channel authz denies outsiders.",
  },
  "SL-T050": {
    setup: "Connected users with conversation; `links_in_messages` flag toggled.",
    steps:
      "1. Send direct message as member.\n2. Attempt message with URL when links disabled.",
    expected:
      "Message delivered to recipient; link body rejected when Q08 flag disabled.",
  },
  "SL-T051": {
    setup: "Connected users; notification service mocked for failure paths.",
    steps:
      "1. Send message with notification DB insert failing.\n2. Send message with email post-commit failure.",
    expected:
      "Message row persists (Q07 post-commit); in-app notification created when email fails (D4 characterized).",
  },
  "SL-T053": {
    setup: "Connected pair; blocker inserts `blocks` row.",
    steps: "Blocked user attempts to insert a new message in the shared conversation.",
    expected: "Insert rejected; blocked party cannot send new messages.",
  },
  "SL-T055": {
    setup: "Connected conversation; React Testing Library for hook; Supabase client mocked.",
    steps:
      "1. Integration: member A sends; member B receives via postgres_changes subscription.\n2. Component: mount `useConversationRealtime`, unmount hook.",
    expected:
      "Realtime delivers inserts to subscribed member; hook removes channel on unmount.",
  },
  "SL-T063": {
    setup: "Connected pair with conversation and catalog game/platform.",
    steps: "Proposer inserts `play_invitations` row for connected recipient.",
    expected: "Invitation row created with proposer/recipient/conversation linkage.",
  },
  "SL-T064": {
    setup: "Connected pair; scheduled play with invalid slot payload (Q10).",
    steps: "Propose play with scheduling mode that fails slot validation.",
    expected:
      "Invitation row remains; atomic slot validation failure does not orphan partial state (D5 characterized).",
  },
  "SL-T067": {
    setup: "Connected pair with accepted flexible play invitation.",
    steps: "Recipient accepts invitation; verify `gaming_sessions` row.",
    expected: "Gaming session created when flexible invitation is accepted.",
  },
  "SL-T078": {
    setup: "Active owner on free tier.",
    steps: "Owner calls `create_private_group` RPC with name and capacity.",
    expected: "Private group row created for owner (Q11/D7 entitlement rules apply).",
  },
  "SL-T081": {
    setup: "Group owner and non-member; active group with conversation.",
    steps:
      "1. pgTAP: owner sends group message; non-member denied read.\n2. Realtime: non-member subscribes to group conversation channel.",
    expected:
      "Non-member cannot read group conversation; Package E group block behavior applies to realtime authz.",
  },
  "SL-T086": {
    setup: "Reporter with message in conversation.",
    steps: "Reporter files report and opens moderation case with message context.",
    expected:
      "Report and case created (Q13/Q14); message excerpt captured as evidence (D6 characterized).",
  },
  "SL-T088": {
    setup: "Blocker and blocked users.",
    steps: "Blocked user attempts to file report against blocker.",
    expected: "Report rejected when block exists (Q03 current behavior).",
  },
  "SL-T090": {
    setup: "Reporter case; support-scoped and safety_review admin fixtures.",
    steps:
      "1. Non-admin attempts case claim.\n2. Support admin attempts claim.\n3. Safety review admin claims case.",
    expected:
      "Only safety_review admin with MFA fixture can claim moderation cases (Q15).",
  },
  "SL-T092": {
    setup: "Safety admin and non-admin; moderation case with evidence.",
    steps: "Non-admin and safety admin attempt to read `moderation_evidence`.",
    expected: "Evidence readable only by safety-scoped admins.",
  },
  "SL-T100": {
    setup: "Vitest api + unit projects; Stripe webhook signature mocks.",
    steps:
      "1. API route: valid/invalid signature, unknown event, replay.\n2. Unit: processStripeEvent subscription lifecycle.",
    expected:
      "Route returns 400 on bad signature; events processed idempotently; subscription status updated.",
  },
  "SL-T101": {
    setup: "Active user with subscription row; Package D contract.",
    steps: "Process `customer.subscription.updated` webhook via `processStripeEvent`.",
    expected:
      "Subscription status becomes `active`; stripe_subscription_id stored; entitlements follow mapped status (Q19).",
  },
  "SL-T102": {
    setup: "User with subscription activated then updated.",
    steps: "Apply initial activation webhook, then later subscription.updated event.",
    expected: "Later event updates subscription without regressing state.",
  },
  "SL-T103": {
    setup: "Canceled subscription user.",
    steps: "Verify read-only entitlements; exercise resubscribe checkout exemption (Q17).",
    expected: "Canceled accounts read-only for writes; checkout path exempt from read-only guard (D3).",
  },
  "SL-T104": {
    setup: "User with subscription row.",
    steps:
      "1. Set canceled subscription; recompute entitlements.\n2. Seed stripe customer metadata on subscription.",
    expected: "Read-only entitlements when canceled; customer metadata persisted.",
  },
  "SL-T107": {
    setup: "Active user without Stripe subscription.",
    steps: "Confirm deletion with password re-auth via billing deletion flow.",
    expected: "Deletion confirmed per Q16 when no Stripe cancel required (D2).",
  },
  "SL-T110": {
    setup: "Vitest api project; CRON_SECRET env.",
    steps: "Call cron routes with missing, wrong, and correct `Authorization: Bearer` secret.",
    expected:
      "Missing/wrong secret → 401; correct secret → 200 (Q21; D1 fail-closed characterized).",
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
    if (!PHASE4_IDS.has(req.id)) continue;
    for (const impl of req.implementations) {
      if (impl.phase === 4) {
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

  console.log(`Phase 4 close: marked ${marked} implementations complete`);
  console.log(
    `Updated ${anchorUpdates} canonical anchor sections (${Object.keys(ANCHORS).length} requirements targeted)`,
  );
}

main();
