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

describe("[SL-T064][integration] @p0 play propose atomicity", () => {
  let proposer: ProvisionedUser | null = null;
  let recipient: ProvisionedUser | null = null;

  afterEach(async () => {
    if (proposer) await deleteAuthUser(proposer.authUserId);
    if (recipient) await deleteAuthUser(recipient.authUserId);
    proposer = null;
    recipient = null;
    await setFeatureFlag("play_invitations_enabled", false);
  });

  it("leaves invitation rows when scheduled slots fail validation (Q10 open)", async () => {
    assertTestGuards();
    await setFeatureFlag("play_invitations_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    proposer = await provisionAuthUser("play-atom-a", { status: "active" });
    recipient = await provisionAuthUser("play-atom-b", { status: "active" });
    await completeActiveProfile(proposer, "AtomProposer");
    await completeActiveProfile(recipient, "AtomRecipient");
    await addUserGame(proposer);
    const { conversationId } = await connectUsers(proposer, recipient);
    const { gameId, platformId } = await getFortniteCatalogIds();

    const session = await signInProvisionedUser(proposer);
    const actor = await createActorClient(session);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    const { data: invitation } = await actor
      .from("play_invitations")
      .insert({
        conversation_id: conversationId,
        proposer_account_id: proposer.accountId,
        recipient_account_id: recipient.accountId,
        game_id: gameId,
        platform_id: platformId,
        scheduling_mode: "scheduled",
        session_length_minutes: 90,
        voice_preferred: false,
        status: "proposed",
        expires_at: expiresAt.toISOString(),
      })
      .select("id")
      .single();

    expect(invitation?.id).toBeTruthy();

    const { error: slotError } = await actor.from("play_time_options").insert({
      invitation_id: invitation!.id as string,
      proposed_start_at: "not-a-timestamp",
      sort_order: 0,
    });
    expect(slotError).toBeTruthy();

    const admin = createFixtureAdmin();
    const { count } = await admin
      .from("play_invitations")
      .select("id", { count: "exact", head: true })
      .eq("id", invitation!.id as string);
    expect(count).toBe(1);

    const { count: slotCount } = await admin
      .from("play_time_options")
      .select("id", { count: "exact", head: true })
      .eq("invitation_id", invitation!.id as string);
    expect(slotCount).toBe(0);
  });
});
