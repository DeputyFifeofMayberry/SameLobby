/**
 * One-shot Phase 6 close: mark P1 implementations complete and fill canonical anchors.
 * Run: npx tsx scripts/close-phase6.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const INVENTORY_PATH = join(ROOT, "tests/test-inventory.json");
const ANCHORS_PATH = join(ROOT, "docs/testing/canonical-anchors.md");

const PHASE6_IDS = new Set([
  "SL-T004",
  "SL-T008",
  "SL-T009",
  "SL-T018",
  "SL-T020",
  "SL-T021",
  "SL-T024",
  "SL-T026",
  "SL-T029",
  "SL-T031",
  "SL-T032",
  "SL-T033",
  "SL-T034",
  "SL-T035",
  "SL-T036",
  "SL-T041",
  "SL-T043",
  "SL-T044",
  "SL-T046",
  "SL-T052",
  "SL-T054",
  "SL-T056",
  "SL-T057",
  "SL-T058",
  "SL-T059",
  "SL-T060",
  "SL-T066",
  "SL-T068",
  "SL-T069",
  "SL-T070",
  "SL-T071",
  "SL-T075",
  "SL-T082",
  "SL-T083",
  "SL-T089",
  "SL-T093",
  "SL-T094",
  "SL-T095",
  "SL-T096",
  "SL-T105",
  "SL-T106",
  "SL-T111",
  "SL-T112",
  "SL-T113",
  "SL-T119",
]);

type AnchorSections = { setup: string; steps: string; expected: string };

const ANCHORS: Record<string, AnchorSections> = {
  "SL-T004": {
    setup:
      "Vitest unit and integration projects; fake timers for in-memory `checkRateLimit`.",
    steps:
      "1. Unit: allow under limit, deny at limit with retryAfterMs, reset after window, isolate per key.\n2. Integration: enforce sign-in limits per email key; sign-up key resets after auth window.",
    expected:
      "Limiter allows then denies at cap with retryAfterMs; window reset clears counter; keys isolated; auth-style keys enforce per-email limits.",
  },
  "SL-T008": {
    setup: "Local Supabase; anon auth client; provisioned active user or unknown email.",
    steps:
      "1. Call `resetPasswordForEmail` for provisioned user.\n2. Call `resetPasswordForEmail` for unknown email.",
    expected:
      "Both paths return generic success with no error (Q01); unknown email does not leak account state.",
  },
  "SL-T009": {
    setup: "React Testing Library; mocked Supabase `updateUser` and Next router.",
    steps:
      "1. Submit mismatched passwords.\n2. Submit weak password.\n3. Submit valid password and wait for pending state.\n4. Submit valid password with update error.",
    expected:
      "Mismatch and weak-password validation shown before Supabase call; pending state disables inputs then redirects to `/sign-in`; update errors surfaced in alert without redirect.",
  },
  "SL-T018": {
    setup: "Vitest unit project; profile schema and completeness fixture objects.",
    steps:
      "Exercise `displayNameSchema`, `communicationStepSchema`, `isProfileComplete`, `profileCompletenessErrors`, and `MAX_ACTIVE_USER_GAMES`.",
    expected:
      "Valid names pass; short names fail; at least one communication mode required; complete profile passes; missing games yields specific error; game cap matches free tier.",
  },
  "SL-T020": {
    setup: "Provisioned active user; password API sign-in; actor Supabase client.",
    steps:
      "1. Insert `current_intents` row via actor.\n2. Update goal and expiry on existing intent.\n3. Read intent back.",
    expected:
      "Actor upserts current intent; updated goal and status persist for own account.",
  },
  "SL-T021": {
    setup: "pgTAP; two active auth users with availability_windows RLS.",
    steps:
      "1. Owner inserts availability window.\n2. Owner reads own windows.\n3. Outsider reads owner windows.\n4. Owner updates and deletes own window.",
    expected:
      "Owner can insert, read, update, and delete own availability; outsider sees zero rows.",
  },
  "SL-T024": {
    setup: "Owner and outsider active users; Fortnite catalog IDs; actor clients.",
    steps:
      "1. Owner upserts `user_games` via actor.\n2. Owner reads own games.\n3. Outsider reads owner games.",
    expected:
      "Owner persists active game/platform row; outsider cannot read another account's games.",
  },
  "SL-T026": {
    setup: "Local Supabase with seeded catalog migrations.",
    steps:
      "pgTAP: count active games, anchor games, anchor slugs, platform coverage, crossplay sets, and slug uniqueness.",
    expected:
      "150 active games; 8 anchor games with expected slugs; every active game has a platform; crossplay sets exist; slugs unique.",
  },
  "SL-T029": {
    setup: "Vitest unit project; discovery cohort helper fixtures.",
    steps:
      "Exercise `timeZoneRegion`, `buildCohortKey`, `cohortStatusFromCount`, `pickAnchorGameSlug`, and `COHORT_MIN_QUALIFIED`.",
    expected:
      "Time zones map to regions; cohort keys deterministic; 39 without demand is below_threshold; 39 with demand is demand_collecting; 40+ is active_discovery; anchor slug preferred with fallback.",
  },
  "SL-T031": {
    setup:
      "Two discoverable users; `discovery_enabled` flag; shared locale, games, and intents.",
    steps:
      "1. Search discoverable profiles.\n2. Call `refreshRecommendations`.\n3. Read `discovery_recommendations` and `getActiveRecommendations`.",
    expected:
      "Target appears in discoverable search; refresh writes recommendation rows with reason codes; active cards include target.",
  },
  "SL-T032": {
    setup: "Synthetic `DiscoveryCandidate` fixtures and crossplay map.",
    steps:
      "1. Rank candidates twice for stable ordering.\n2. Rank 20 candidates.\n3. Rank with blocked pair set.",
    expected:
      "Ranking stable; higher reason count wins with display-name tie-break; capped at MAX_RECOMMENDATIONS; blocked pairs excluded in either direction.",
  },
  "SL-T033": {
    setup:
      "Two discoverable users with games and intents; `discovery_enabled` flag on.",
    steps: "Call `getCohortSnapshot` for viewer account.",
    expected:
      "Snapshot returns cohort key, qualified count ≥ 2, and valid cohort status (below_threshold through active_discovery).",
  },
  "SL-T034": {
    setup: "pgTAP; viewer, target, and blocked active users; blocks and reason codes seeded.",
    steps:
      "1. Viewer queries target gamer_profile.\n2. Insert block; viewer reads own blocks.\n3. Count recommendation_reason_codes.",
    expected:
      "Gamer profiles remain own-only; blocker sees own block row; six reason codes seeded.",
  },
  "SL-T035": {
    setup: "Active user with completed profile; `discovery_enabled` flag on.",
    steps: "Actor updates `discovery_paused_at` on own gamer_profile.",
    expected: "Pause timestamp persisted on gamer_profiles.",
  },
  "SL-T036": {
    setup:
      "Viewer plus fortnite and halo discoverable users; `discovery_enabled` flag on.",
    steps:
      "Search discoverable profiles filtered by fortnite/pc game and platform IDs.",
    expected:
      "Fortnite user included; halo user excluded from filtered results.",
  },
  "SL-T041": {
    setup:
      "Two active users with completed profiles; `connection_requests_enabled` flag on.",
    steps:
      "1. Send pending request; recipient accepts.\n2. Send pending request; recipient declines.\n3. Send pending request; sender cancels.",
    expected:
      "Accept → request accepted and connection connected; decline → request declined; cancel → request cancelled.",
  },
  "SL-T043": {
    setup:
      "Blocker and blocked active users; `connection_requests_enabled` flag on.",
    steps:
      "1. Block then attempt new connection request from blocked party.\n2. Pending request then block; attempt accept RPC.\n3. Connected pair before block.",
    expected:
      "Blocked user cannot send new requests; accept fails when block exists; existing connection remains connected until archived.",
  },
  "SL-T044": {
    setup: "Vitest unit project; connection limit and message schema fixtures.",
    steps:
      "Exercise `connectionRequestLimitError` at pending and daily caps; validate `connectionRequestMessageSchema` with link and plain text.",
    expected:
      "Pending and daily caps return limit errors; under limits returns null; links rejected; short plain text accepted.",
  },
  "SL-T046": {
    setup:
      "React Testing Library; mocked connection actions; pending incoming/outgoing request fixtures.",
    steps:
      "1. Accept incoming request.\n2. Accept while action pending.\n3. Cancel outgoing request.",
    expected:
      "Accept calls action once; buttons disabled during pending transition; cancel invokes cancel action for outgoing request.",
  },
  "SL-T052": {
    setup:
      "Connected pair with message; messaging and connection flags on.",
    steps:
      "1. Sender inserts message.\n2. Recipient updates `conversation_members.last_read_at`.",
    expected: "Recipient membership last_read_at updated when conversation opened.",
  },
  "SL-T054": {
    setup: "React Testing Library; mocked `sendMessage` action; composer harness.",
    steps:
      "1. Submit empty draft.\n2. Submit link draft; confirm send anyway.\n3. Submit with server error.\n4. Submit successful message.",
    expected:
      "Empty draft keeps send disabled; link blocked until confirmation; server errors shown in alert; draft cleared after success.",
  },
  "SL-T056": {
    setup:
      "Connected pair; messaging and connection flags on.",
    steps:
      "1. User A sends message.\n2. User B signs in fresh session and reads conversation messages.",
    expected:
      "Messages readable after simulated client reconnect with new session.",
  },
  "SL-T057": {
    setup: "pgTAP; connected pair with conversation and expired message row.",
    steps:
      "1. Verify expired message exists.\n2. Call `purge_expired_messages(500)`.",
    expected:
      "Expired message present before purge; purge returns 1 and removes expired row.",
  },
  "SL-T058": {
    setup: "Connected pair; notification service with admin readback.",
    steps: "Call `createNewMessageNotification` for recipient after connect.",
    expected:
      "In-app `new_message` notification row inserted for recipient with title and href.",
  },
  "SL-T059": {
    setup: "Provisioned active user; actor session.",
    steps:
      "1. Read `notification_preferences`.\n2. Upsert `email_new_message` false.\n3. Read preferences again.",
    expected:
      "Owner reads and updates own notification preferences; email_new_message persists as false.",
  },
  "SL-T060": {
    setup: "Mocked Resend client; RESEND_API_KEY and FROM_EMAIL configured.",
    steps: "Call `sendNewMessageEmail` with recipient and conversation URL.",
    expected:
      "Resend send invoked once with correct to address and new-message subject.",
  },
  "SL-T066": {
    setup:
      "Connected pair with proposed play invitation; play and connection flags on.",
    steps:
      "1. Recipient declines proposed invitation.\n2. Accept invitation then cancel confirmed gaming session.",
    expected:
      "Decline → invitation status declined; cancel → gaming session status cancelled.",
  },
  "SL-T068": {
    setup: "Vitest unit project; play timezone helper fixtures.",
    steps:
      "Exercise `formatInTimeZone`, `formatSessionRange`, `datetimeLocalToUtcIso`, and `generateIcsEvent`.",
    expected:
      "LA formatting produces readable label; matching zones yield single label; differing zones yield other label; local datetime converts to UTC; ICS contains VEVENT with DTSTART/DTEND.",
  },
  "SL-T069": {
    setup: "Vitest api project; mocked session user, account, and session detail queries.",
    steps:
      "1. GET calendar route with no session.\n2. GET with session but missing session detail.\n3. GET as authorized participant.",
    expected:
      "No session → 401; invisible session → 404; authorized participant → 200 text/calendar attachment with VCALENDAR and game name.",
  },
  "SL-T070": {
    setup:
      "Connected pair with accepted play session; play and connection flags on.",
    steps: "Participant upserts `post_play_feedback` with continuation `play_again`.",
    expected: "Feedback row stored with continuation value for session participant.",
  },
  "SL-T071": {
    setup:
      "Confirmed play session starting within 24h window; play and connection flags on.",
    steps: "Run `runPlayReminders` job.",
    expected:
      "Reminder notifications created for sessions in the 24-hour window.",
  },
  "SL-T075": {
    setup:
      "Connected pair with completed play session; teammates and play flags on.",
    steps:
      "1. Complete gaming session.\n2. Proposer calls `propose_teammate` RPC.\n3. Read `teammate_relationships`.",
    expected:
      "Teammate relationship row created with ordered pair, connection linkage, and proposed/teammate/regular_teammate status.",
  },
  "SL-T082": {
    setup: "pgTAP; active group owner authenticated.",
    steps:
      "Create private group, activate it, insert open seat as group member.",
    expected: "Group member can create open seat row via RLS.",
  },
  "SL-T083": {
    setup: "Active owner; `private_groups_enabled` flag on.",
    steps:
      "1. Call `create_private_group` RPC.\n2. Activate group.\n3. Call `create_conversation_for_group`.",
    expected:
      "Group created; conversation provisioned with kind `group` and matching group_id.",
  },
  "SL-T089": {
    setup: "Vitest unit project; moderation severity keyword fixtures.",
    steps:
      "Call `assignReportSeverity` for imminent harm, harassment, inappropriate content, and spam.",
    expected:
      "Imminent harm → p0; harassment → p1; inappropriate content → p2; spam → p3.",
  },
  "SL-T093": {
    setup:
      "Subject and safety-review admin; moderation case with warn action.",
    steps:
      "1. Admin applies warn action.\n2. Subject submits appeal within window.\n3. Subject attempts duplicate appeal.",
    expected:
      "Appeal submitted successfully; duplicate appeal rejected.",
  },
  "SL-T094": {
    setup:
      "pgTAP; moderation case with open action, expired penalty, and reversed appeal.",
    steps:
      "1. Check release eligibility on open case.\n2. Insert expired penalty; recheck.\n3. Insert reversed appeal action; recheck.",
    expected:
      "Open case not releasable; expired penalty releasable; reversed appeal releasable.",
  },
  "SL-T095": {
    setup: "Admin with security_break_glass scope and outsider user.",
    steps:
      "1. Admin reads feature_flags.\n2. Service role toggles flag.\n3. Outsider attempts update.\n4. Admin re-reads flag.",
    expected:
      "Admin reads flags; service role update succeeds; outsider update denied; toggled value persists.",
  },
  "SL-T096": {
    setup: "Catalog admin with catalog scope and outsider user.",
    steps:
      "1. Catalog admin reads games table.\n2. Outsider reads public games.",
    expected:
      "Catalog admin reads fortnite row; outsider can read active public game catalog.",
  },
  "SL-T105": {
    setup: "pgTAP; plus-tier user A and user B with saved_searches RLS.",
    steps:
      "1. Plus user inserts saved search.\n2. Owner reads own searches.\n3. Outsider reads user A searches.\n4. Outsider attempts insert for user A.\n5. Owner deletes own search.",
    expected:
      "Owner CRUD on own rows; outsider cannot read or insert for another account.",
  },
  "SL-T106": {
    setup: "Active users; fixture admin and entitlements recompute RPC.",
    steps:
      "1. Recompute entitlements for free-tier account.\n2. Upsert active subscription; recompute for plus account.",
    expected:
      "Free tier limits match FREE_LIMITS; plus subscription yields plus tier with PLUS_LIMITS caps.",
  },
  "SL-T111": {
    setup: "Local Supabase; message purge job harness.",
    steps: "Run `runMessagePurge` twice in succession.",
    expected:
      "First run deletes ≥ 0 rows; second run returns zero deleted (idempotent hourly purge).",
  },
  "SL-T112": {
    setup: "Vitest api project; mocked Supabase database probe.",
    steps:
      "1. Probe succeeds.\n2. Probe returns error.\n3. Probe throws.",
    expected:
      "Healthy → 200 app/database ok; degraded probe → 503 database degraded (Q20); thrown probe → 503 database unavailable.",
  },
  "SL-T113": {
    setup: "Vitest unit-decision project; smoke-post-deploy script source.",
    steps:
      "1. Assert script references health endpoint and ok check.\n2. Characterize degraded vs unavailable acceptance.",
    expected:
      "Smoke script documents `/api/health` check; 200 passes; 503 fails; degraded-health still-passes decision recorded.",
  },
  "SL-T119": {
    setup:
      "Vitest env stubs; CI `env-production-gate` job without SKIP_ENV_VALIDATION.",
    steps:
      "1. Import env with SKIP_ENV_VALIDATION and placeholders.\n2. Import without service role key.\n3. Import production without CRON_SECRET.\n4. CI: production build with required env vars, no skip flag.",
    expected:
      "Skip flag accepts placeholders; missing service role or CRON_SECRET throws; CI production build passes env gate.",
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
    if (!PHASE6_IDS.has(req.id)) continue;
    for (const impl of req.implementations) {
      if (impl.phase === 6) {
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

  console.log(`Phase 6 close: marked ${marked} implementations complete`);
  console.log(
    `Updated ${anchorUpdates} canonical anchor sections (${Object.keys(ANCHORS).length} requirements targeted)`,
  );
}

main();
