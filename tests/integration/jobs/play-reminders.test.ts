import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  addUserGame,
  completeActiveProfile,
  connectUsers,
  getFortniteCatalogIds,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient, createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";
import { runPlayReminders } from "@/jobs/play-reminders";

describe("[SL-T071][integration] @p1 play reminder job", () => {
  let proposer: ProvisionedUser | null = null;
  let recipient: ProvisionedUser | null = null;

  afterEach(async () => {
    if (proposer) await deleteAuthUser(proposer.authUserId);
    if (recipient) await deleteAuthUser(recipient.authUserId);
    proposer = null;
    recipient = null;
    await setFeatureFlag("play_invitations_enabled", false);
    await setFeatureFlag("connection_requests_enabled", false);
  });

  it("creates reminder notifications for sessions in the 24h window", async () => {
    assertTestGuards();
    await setFeatureFlag("play_invitations_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    proposer = await provisionAuthUser("play-rem-a", { status: "active" });
    recipient = await provisionAuthUser("play-rem-b", { status: "active" });
    await completeActiveProfile(proposer, "RemProposer");
    await completeActiveProfile(recipient, "RemRecipient");
    await addUserGame(proposer);
    const { conversationId } = await connectUsers(proposer, recipient);
    const { gameId, platformId } = await getFortniteCatalogIds();
    const admin = createFixtureAdmin();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    const { data: invitation } = await admin
      .from("play_invitations")
      .insert({
        conversation_id: conversationId,
        proposer_account_id: proposer.accountId,
        recipient_account_id: recipient.accountId,
        game_id: gameId,
        platform_id: platformId,
        scheduling_mode: "play_now",
        session_length_minutes: 60,
        voice_preferred: false,
        status: "proposed",
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    const recipientSession = await signInProvisionedUser(recipient);
    const recipientActor = await createActorClient(recipientSession);
    await recipientActor.rpc("accept_play_invitation", {
      p_invitation_id: invitation!.id as string,
      p_time_option_id: null,
    });

    const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await admin
      .from("gaming_sessions")
      .update({ confirmed_start_at: startAt.toISOString() })
      .eq("invitation_id", invitation!.id as string);

    const result = await runPlayReminders();
    expect(result.sent).toBeGreaterThanOrEqual(1);

    const { data: notifications } = await admin
      .from("notifications")
      .select("kind, account_id")
      .eq("kind", "play_reminder")
      .in("account_id", [proposer.accountId, recipient.accountId]);
    expect((notifications ?? []).length).toBeGreaterThanOrEqual(2);

    const { data: updated } = await admin
      .from("gaming_sessions")
      .select("reminder_24h_sent_at")
      .eq("invitation_id", invitation!.id as string)
      .single();
    expect(updated?.reminder_24h_sent_at).toBeTruthy();
  });
});
