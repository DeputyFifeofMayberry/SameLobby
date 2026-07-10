import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  completeActiveProfile,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient, createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T081][realtime] @p0 group realtime authz", () => {
  let owner: ProvisionedUser | null = null;
  let outsider: ProvisionedUser | null = null;

  afterEach(async () => {
    if (owner) await deleteAuthUser(owner.authUserId);
    if (outsider) await deleteAuthUser(outsider.authUserId);
    owner = null;
    outsider = null;
    await setFeatureFlag("private_groups_enabled", false);
    await setFeatureFlag("messaging_enabled", false);
  });

  it("denies non-members read access to group conversations (Q12 open)", async () => {
    assertTestGuards();
    await setFeatureFlag("private_groups_enabled", true);
    await setFeatureFlag("messaging_enabled", true);
    owner = await provisionAuthUser("grp-rt-owner", { status: "active" });
    outsider = await provisionAuthUser("grp-rt-out", { status: "active" });
    await completeActiveProfile(owner, "GrpOwner");
    await completeActiveProfile(outsider, "GrpOutsider");

    const ownerSession = await signInProvisionedUser(owner);
    const ownerActor = await createActorClient(ownerSession);
    const { data: groupId, error: groupError } = await ownerActor.rpc("create_private_group", {
      p_name: "Realtime Squad",
      p_size_goal: 3,
      p_emblem_key: "leaf",
      p_shared_game_id: null,
    });
    expect(groupError).toBeNull();

    const admin = createFixtureAdmin();
    await admin
      .from("private_groups")
      .update({ status: "active" })
      .eq("id", groupId as string);
    const { data: conversationId, error: convError } = await admin.rpc(
      "create_conversation_for_group",
      {
        p_group_id: groupId as string,
      },
    );
    expect(convError).toBeNull();

    const retentionAt = new Date();
    retentionAt.setMonth(retentionAt.getMonth() + 12);
    await admin.from("messages").insert({
      conversation_id: conversationId as string,
      sender_account_id: owner.accountId,
      body: "Group secret",
      retention_at: retentionAt.toISOString(),
    });

    const outsiderSession = await signInProvisionedUser(outsider);
    const outsiderActor = await createActorClient(outsiderSession);
    const { data: leaked } = await outsiderActor
      .from("messages")
      .select("id")
      .eq("conversation_id", conversationId as string);
    expect(leaked ?? []).toHaveLength(0);
  });
});
