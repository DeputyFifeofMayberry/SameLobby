/**
 * One-shot Phase 2 close: mark pgTAP implementations complete and fill canonical anchors.
 * Run: npx tsx scripts/close-phase2.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const INVENTORY_PATH = join(ROOT, "tests/test-inventory.json");
const ANCHORS_PATH = join(ROOT, "docs/testing/canonical-anchors.md");

const PHASE2_IDS = new Set([
  "SL-T005",
  "SL-T012",
  "SL-T015",
  "SL-T019",
  "SL-T025",
  "SL-T040",
  "SL-T042",
  "SL-T047",
  "SL-T049",
  "SL-T065",
  "SL-T074",
  "SL-T076",
  "SL-T077",
  "SL-T079",
  "SL-T080",
  "SL-T081",
  "SL-T087",
  "SL-T091",
  "SL-T097",
  "SL-T098",
  "SL-T109",
]);

type AnchorSections = { setup: string; steps: string; expected: string };

const ANCHORS: Record<string, AnchorSections> = {
  "SL-T005": {
    setup:
      "Postgres role via `tests.as_postgres()`. No pre-existing auth user for fixture UUID `f1111111-1111-1111-1111-111111111111`.",
    steps:
      "1. Assert no `accounts` row for the UUID.\n2. Insert `auth.users` row with email `provision-new@test.local`.\n3. Query provisioned `accounts`, `gamer_profiles`, `disclosure_settings`, and `entitlements` rows.",
    expected:
      "Account row created by `handle_new_user` in `onboarding` status with matching email; `gamer_profiles` row from `handle_new_account_profile`; three default `disclosure_settings`; `entitlements` tier `free`.",
  },
  "SL-T012": {
    setup:
      "Postgres inserts auth user `f2222222-2222-2222-2222-222222222222` with provisioned onboarding account.",
    steps:
      "1. Call `complete_account_attestation` as service role.\n2. Set authenticated JWT for the user.\n3. Attempt direct `accounts.status` update.",
    expected:
      "Account becomes `active`; four `consent_events` recorded; authenticated user cannot mutate protected status (`42501`).",
  },
  "SL-T015": {
    setup:
      "Two active accounts: one with confirmed `deletion_requests`, one with active `legal_holds`.",
    steps:
      "1. Run `process_deletion_stage(5)` for deletable account.\n2. Assert held account remains `deletion_pending` after pipeline.\n3. Re-run `process_deletion_stage(5)` after deletion completes.",
    expected:
      "Deletable account becomes `deleted`; legal hold blocks finalization; second pipeline pass returns 0 (idempotent).",
  },
  "SL-T019": {
    setup:
      "Two active accounts with catalog `games`/`platforms` seeded.",
    steps:
      "1. Owner upserts and reads own `user_games`.\n2. Outsider attempts read, delete, and update on owner's rows.",
    expected:
      "Owner CRUD succeeds; outsider sees zero rows and cannot mutate another account's `user_games`.",
  },
  "SL-T025": {
    setup:
      "Owner account with `gamer_profiles` and `disclosure_settings`; outsider and anon roles available.",
    steps:
      "1. Owner reads own profile tables.\n2. Outsider reads and updates owner's profile data.\n3. Anon reads public `games` catalog.",
    expected:
      "Owner reads succeed; outsider denied cross-account reads/writes; anon can read public catalog.",
  },
  "SL-T040": {
    setup:
      "Sender and recipient active accounts; optional block between a third pair.",
    steps:
      "1. Sender inserts `connection_requests`.\n2. Attempt duplicate pending request.\n3. Recipient accepts; verify `connections` row.\n4. Blocked pair attempts new request; outsider reads unrelated requests; sender attempts cancel via direct update.",
    expected:
      "Request visible to parties; duplicate blocked; acceptance creates connection; blocks prevent new requests; outsiders isolated; senders cannot cancel via table update.",
  },
  "SL-T042": {
    setup:
      "Blocker and blocked active accounts.",
    steps:
      "1. Insert `blocks` row.\n2. Verify `block_enforcement_keys` and `accounts_blocked`.\n3. Blocked user sends connection request.\n4. Delete blocker account; re-check enforcement keys.",
    expected:
      "Enforcement keys sync; `accounts_blocked` true; blocked cannot send requests; enforcement keys survive blocker deletion.",
  },
  "SL-T047": {
    setup:
      "Same connection fixture as SL-T040 (shared `connections.test.sql`).",
    steps:
      "Exercise recipient acceptance path and participant visibility rules from the shared connection lifecycle test.",
    expected:
      "Recipient acceptance creates `connections` row; participants cannot see unrelated requests.",
  },
  "SL-T049": {
    setup:
      "Connected pair with `conversations` row; optional block inserted mid-test.",
    steps:
      "1. Member sends message.\n2. Non-member reads conversation.\n3. Insert block; verify conversation hidden and send blocked.",
    expected:
      "Members send/read; non-members denied; blocking hides conversation and prevents sends.",
  },
  "SL-T065": {
    setup:
      "Connected pair with conversation; third non-participant account.",
    steps:
      "1. Proposer inserts `play_invitations`.\n2. Non-participant reads invitations.\n3. Insert block; proposer reads invitations again.",
    expected:
      "Proposer insert succeeds; non-participant sees zero rows; blocked pair cannot read invitations.",
  },
  "SL-T074": {
    setup:
      "Two connected accounts with `teammate_relationships` and `teammate_notes`.",
    steps:
      "1. Participant reads relationship.\n2. Author writes private note.\n3. Other participant, outsider, and blocked participant attempt reads.",
    expected:
      "Participants read relationships; authors write notes; other participant, outsider, and blocked users denied.",
  },
  "SL-T076": {
    setup:
      "Shared teammate fixture (same file as SL-T074).",
    steps:
      "Verify note privacy: only the authoring participant can read their private `teammate_notes`.",
    expected:
      "Non-authors cannot read another user's teammate notes.",
  },
  "SL-T077": {
    setup:
      "Owner on free tier; second account as non-member.",
    steps:
      "1. Owner creates private group.\n2. Non-member reads group.\n3. Owner attempts second active owned group.",
    expected:
      "Owner creates group; non-member sees zero rows; free tier rejects second active owned group.",
  },
  "SL-T079": {
    setup:
      "Small private group with pending invitee and member voters.",
    steps:
      "1. Invite member; assert `pending_approval`.\n2. Cast insufficient votes.\n3. Meet quorum; assert `active` membership.",
    expected:
      "Single approval insufficient; quorum activates invitee.",
  },
  "SL-T080": {
    setup:
      "Private group with owner and non-member accounts.",
    steps:
      "1. Owner calls `transfer_private_group_ownership`.\n2. Non-member attempts transfer.",
    expected:
      "Owner transfer updates `owner_account_id`; non-member transfer rejected.",
  },
  "SL-T081": {
    setup:
      "Group owner and non-member; group activated with conversation.",
    steps:
      "1. Owner creates group and conversation.\n2. Non-member reads group conversation.\n3. Owner sends group message.",
    expected:
      "Non-member cannot read conversation before joining; owner can send messages.",
  },
  "SL-T087": {
    setup:
      "Reporter with message in conversation; outsider account.",
    steps:
      "1. Reporter files report with `include_message_context`.\n2. Reporter opens moderation case.\n3. Outsider opens case from reporter's report.",
    expected:
      "Case opens with `message_excerpt` evidence; outsider cannot open another user's case.",
  },
  "SL-T091": {
    setup:
      "Reporter, `safety_review` admin, and non-admin accounts.",
    steps:
      "1. Reporter opens case.\n2. Admin claims and applies `restrict_discovery`.\n3. Non-admin attempts claim.",
    expected:
      "Admin claim and action recorded; non-admin claim rejected.",
  },
  "SL-T097": {
    setup:
      "Owner with locale, profile, and active `user_games`; outsider account.",
    steps:
      "1. Owner calls `export_account_data`.\n2. Outsider calls export for owner's account id.",
    expected:
      "Export includes locale, games array, and display name; outsider receives null payload.",
  },
  "SL-T098": {
    setup:
      "Service role inserts `audit_events` test row.",
    steps:
      "1. Authenticated role attempts update.\n2. Attempt delete.\n3. Attempt insert.",
    expected:
      "All three DML operations affect zero rows for authenticated role (append-only audit log).",
  },
  "SL-T109": {
    setup:
      "`relation_security_expectations` manifest loaded for all public tables.",
    steps:
      "Run manifest audit comparing RLS enablement, role grants, and authenticated policies to expectations.",
    expected:
      "Every public table matches manifest: RLS state, grants, and policy operations align with classification.",
  },
};

function patchAnchors(markdown: string): string {
  let out = markdown;
  for (const [id, sections] of Object.entries(ANCHORS)) {
    const hid = id.toLowerCase().replace("sl-t", "sl-t");
    for (const [suffix, content] of Object.entries({
      setup: sections.setup,
      steps: sections.steps,
      expected: sections.expected,
    })) {
      const anchorId = `${hid}-${suffix}`;
      const heading =
        suffix === "setup" ? "Setup" : suffix === "steps" ? "Steps" : "Expected";
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
    if (!PHASE2_IDS.has(req.id)) continue;
    for (const impl of req.implementations) {
      if (impl.phase === 2) {
        impl.implementationStatus = "complete";
        marked++;
      }
    }
  }

  writeFileSync(INVENTORY_PATH, `${JSON.stringify(inv, null, 2)}\n`, "utf8");

  const anchors = patchAnchors(readFileSync(ANCHORS_PATH, "utf8"));
  writeFileSync(ANCHORS_PATH, anchors, "utf8");

  console.log(`Phase 2 close: marked ${marked} implementations complete`);
  console.log(`Updated canonical anchors for ${Object.keys(ANCHORS).length} requirements`);
}

main();
