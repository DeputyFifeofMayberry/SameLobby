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

describe("[SL-T067][integration] @p0 play sessions", () => {
  let proposer: ProvisionedUser | null = null;
  let recipient: ProvisionedUser | null = null;

  afterEach(async () => {
    if (proposer) await deleteAuthUser(proposer.authUserId);
    if (recipient) await deleteAuthUser(recipient.authUserId);
    proposer = null;
    recipient = null;
    await setFeatureFlag("play_invitations_enabled", false);
  });

  it("creates a gaming session when a flexible invitation is accepted", async () => {
    assertTestGuards();
    await setFeatureFlag("play_invitations_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    proposer = await provisionAuthUser("play-sess-a", { status: "active" });
    recipient = await provisionAuthUser("play-sess-b", { status: "active" });
    await completeActiveProfile(proposer, "SessProposer");
    await completeActiveProfile(recipient, "SessRecipient");
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
    const { data: sessionId, error } = await recipientActor.rpc(
      "accept_play_invitation",
      {
        p_invitation_id: invitation!.id as string,
        p_time_option_id: null,
      },
    );
    expect(error).toBeNull();
    expect(sessionId).toBeTruthy();

    const { data: session } = await admin
      .from("gaming_sessions")
      .select("status, invitation_id")
      .eq("id", sessionId as string)
      .single();
    expect(session?.invitation_id).toBe(invitation!.id);
    expect(session?.status).toBeTruthy();
  });
});
