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
import { createActorClient } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T063][integration] @p0 play propose", () => {
  let proposer: ProvisionedUser | null = null;
  let recipient: ProvisionedUser | null = null;

  afterEach(async () => {
    if (proposer) await deleteAuthUser(proposer.authUserId);
    if (recipient) await deleteAuthUser(recipient.authUserId);
    proposer = null;
    recipient = null;
    await setFeatureFlag("play_invitations_enabled", false);
  });

  it("creates a proposed play invitation between connected players", async () => {
    assertTestGuards();
    await setFeatureFlag("play_invitations_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    proposer = await provisionAuthUser("play-prop-a", { status: "active" });
    recipient = await provisionAuthUser("play-prop-b", { status: "active" });
    await completeActiveProfile(proposer, "PlayProposer");
    await completeActiveProfile(recipient, "PlayRecipient");
    await addUserGame(proposer);
    const { conversationId } = await connectUsers(proposer, recipient);
    const { gameId, platformId } = await getFortniteCatalogIds();

    const session = await signInProvisionedUser(proposer);
    const actor = await createActorClient(session);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    const { data: invitation, error } = await actor
      .from("play_invitations")
      .insert({
        conversation_id: conversationId,
        proposer_account_id: proposer.accountId,
        recipient_account_id: recipient.accountId,
        game_id: gameId,
        platform_id: platformId,
        scheduling_mode: "play_now",
        session_length_minutes: 90,
        voice_preferred: false,
        status: "proposed",
        expires_at: expiresAt.toISOString(),
      })
      .select("id, status")
      .single();

    expect(error).toBeNull();
    expect(invitation?.status).toBe("proposed");
  });
});
