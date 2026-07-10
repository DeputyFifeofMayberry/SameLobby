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

describe("[SL-T066][integration] @p1 play transitions", () => {
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

  async function createProposedInvitation() {
    proposer = await provisionAuthUser("play-trans-a", { status: "active" });
    recipient = await provisionAuthUser("play-trans-b", { status: "active" });
    await completeActiveProfile(proposer, "PlayTransProposer");
    await completeActiveProfile(recipient, "PlayTransRecipient");
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
    return invitation!.id as string;
  }

  it("declines a proposed invitation", async () => {
    assertTestGuards();
    await setFeatureFlag("play_invitations_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    const invitationId = await createProposedInvitation();

    const session = await signInProvisionedUser(recipient!);
    const actor = await createActorClient(session);
    const { error } = await actor
      .from("play_invitations")
      .update({ status: "declined" })
      .eq("id", invitationId)
      .eq("recipient_account_id", recipient!.accountId)
      .eq("status", "proposed");
    expect(error).toBeNull();

    const { data: invitation } = await actor
      .from("play_invitations")
      .select("status")
      .eq("id", invitationId)
      .single();
    expect(invitation?.status).toBe("declined");
  });

  it("cancels a confirmed session", async () => {
    assertTestGuards();
    await setFeatureFlag("play_invitations_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    const invitationId = await createProposedInvitation();

    const recipientSession = await signInProvisionedUser(recipient!);
    const recipientActor = await createActorClient(recipientSession);
    const { data: sessionId } = await recipientActor.rpc(
      "accept_play_invitation",
      { p_invitation_id: invitationId, p_time_option_id: null },
    );

    const { error } = await recipientActor
      .from("gaming_sessions")
      .update({ status: "cancelled" })
      .eq("id", sessionId as string)
      .in("status", ["confirmed", "in_progress"]);
    expect(error).toBeNull();

    const { data: session } = await recipientActor
      .from("gaming_sessions")
      .select("status")
      .eq("id", sessionId as string)
      .single();
    expect(session?.status).toBe("cancelled");
  });
});
