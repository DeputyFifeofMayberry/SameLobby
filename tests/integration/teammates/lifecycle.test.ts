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
import { orderedPair } from "@/domains/connections/helpers";

describe("[SL-T075][integration] @p1 teammate lifecycle", () => {
  let userA: ProvisionedUser | null = null;
  let userB: ProvisionedUser | null = null;

  afterEach(async () => {
    if (userA) await deleteAuthUser(userA.authUserId);
    if (userB) await deleteAuthUser(userB.authUserId);
    userA = null;
    userB = null;
    await setFeatureFlag("teammates_enabled", false);
    await setFeatureFlag("play_invitations_enabled", false);
    await setFeatureFlag("connection_requests_enabled", false);
  });

  it("creates and reads teammate_relationships between connected users", async () => {
    assertTestGuards();
    await setFeatureFlag("teammates_enabled", true);
    await setFeatureFlag("play_invitations_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    userA = await provisionAuthUser("tm-a", { status: "active" });
    userB = await provisionAuthUser("tm-b", { status: "active" });
    await completeActiveProfile(userA, "TeammateA");
    await completeActiveProfile(userB, "TeammateB");
    await addUserGame(userA);
    const { conversationId, connectionId } = await connectUsers(userA, userB);
    const { gameId, platformId } = await getFortniteCatalogIds();
    const admin = createFixtureAdmin();
    const pair = orderedPair(userA.accountId, userB.accountId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    const { data: invitation } = await admin
      .from("play_invitations")
      .insert({
        conversation_id: conversationId,
        proposer_account_id: userA.accountId,
        recipient_account_id: userB.accountId,
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

    const recipientSession = await signInProvisionedUser(userB);
    const recipientActor = await createActorClient(recipientSession);
    const { data: sessionId } = await recipientActor.rpc(
      "accept_play_invitation",
      { p_invitation_id: invitation!.id as string, p_time_option_id: null },
    );

    await admin
      .from("gaming_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", sessionId as string);

    const proposerSession = await signInProvisionedUser(userA);
    const proposerActor = await createActorClient(proposerSession);
    const { data: relationshipId, error: proposeError } = await proposerActor.rpc(
      "propose_teammate",
      { p_other_account_id: userB.accountId },
    );
    expect(proposeError).toBeNull();
    expect(relationshipId).toBeTruthy();

    const { data: relationships } = await proposerActor
      .from("teammate_relationships")
      .select("status, user_a_id, user_b_id, connection_id")
      .eq("connection_id", connectionId);
    expect(relationships).toHaveLength(1);
    expect(relationships?.[0]?.user_a_id).toBe(pair.userA);
    expect(relationships?.[0]?.user_b_id).toBe(pair.userB);
    expect(["proposed", "teammate", "regular_teammate"]).toContain(
      relationships?.[0]?.status,
    );
  });
});
