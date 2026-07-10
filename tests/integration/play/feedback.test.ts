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

describe("[SL-T070][integration] @p1 post-play feedback", () => {
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

  it("stores continuation feedback for a session participant", async () => {
    assertTestGuards();
    await setFeatureFlag("play_invitations_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    proposer = await provisionAuthUser("play-fb-a", { status: "active" });
    recipient = await provisionAuthUser("play-fb-b", { status: "active" });
    await completeActiveProfile(proposer, "FbProposer");
    await completeActiveProfile(recipient, "FbRecipient");
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
    const { data: sessionId } = await recipientActor.rpc(
      "accept_play_invitation",
      { p_invitation_id: invitation!.id as string, p_time_option_id: null },
    );

    const { error } = await recipientActor.from("post_play_feedback").upsert(
      {
        session_id: sessionId as string,
        account_id: recipient.accountId,
        continuation: "play_again",
      },
      { onConflict: "session_id,account_id" },
    );
    expect(error).toBeNull();

    const { data: feedback } = await recipientActor
      .from("post_play_feedback")
      .select("continuation")
      .eq("session_id", sessionId as string)
      .eq("account_id", recipient.accountId)
      .single();
    expect(feedback?.continuation).toBe("play_again");
  });
});
