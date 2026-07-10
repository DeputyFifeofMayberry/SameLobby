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

describe("[SL-T083][integration] @p1 group conversation", () => {
  let owner: ProvisionedUser | null = null;

  afterEach(async () => {
    if (owner) await deleteAuthUser(owner.authUserId);
    owner = null;
    await setFeatureFlag("private_groups_enabled", false);
  });

  it("creates a group and provisions a conversation via create_conversation_for_group", async () => {
    assertTestGuards();
    await setFeatureFlag("private_groups_enabled", true);
    owner = await provisionAuthUser("group-conv-owner", { status: "active" });
    await completeActiveProfile(owner, "GroupConvOwner");

    const session = await signInProvisionedUser(owner);
    const actor = await createActorClient(session);
    const { data: groupId, error: groupError } = await actor.rpc(
      "create_private_group",
      {
        p_name: "Conv Squad",
        p_size_goal: 4,
        p_emblem_key: "leaf",
        p_shared_game_id: null,
      },
    );
    expect(groupError).toBeNull();
    expect(groupId).toBeTruthy();

    const admin = createFixtureAdmin();
    await admin
      .from("private_groups")
      .update({ status: "active" })
      .eq("id", groupId as string);

    const { data: conversationId, error: convError } = await actor.rpc(
      "create_conversation_for_group",
      { p_group_id: groupId as string },
    );
    expect(convError).toBeNull();
    expect(conversationId).toBeTruthy();

    const { data: conversation } = await admin
      .from("conversations")
      .select("kind, group_id")
      .eq("id", conversationId as string)
      .single();
    expect(conversation?.kind).toBe("group");
    expect(conversation?.group_id).toBe(groupId);
  });
});
