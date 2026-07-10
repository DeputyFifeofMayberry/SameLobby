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

describe("[SL-T078][integration] @p0 group create", () => {
  let owner: ProvisionedUser | null = null;

  afterEach(async () => {
    if (owner) await deleteAuthUser(owner.authUserId);
    owner = null;
    await setFeatureFlag("private_groups_enabled", false);
  });

  it("creates a private group via RPC for an active owner", async () => {
    assertTestGuards();
    await setFeatureFlag("private_groups_enabled", true);
    owner = await provisionAuthUser("group-owner", { status: "active" });
    await completeActiveProfile(owner, "GroupOwner");

    const session = await signInProvisionedUser(owner);
    const actor = await createActorClient(session);
    const { data: groupId, error } = await actor.rpc("create_private_group", {
      p_name: "Squad Alpha",
      p_size_goal: 4,
      p_emblem_key: "leaf",
      p_shared_game_id: null,
    });
    expect(error).toBeNull();
    expect(groupId).toBeTruthy();

    const admin = createFixtureAdmin();
    const { data: group } = await admin
      .from("private_groups")
      .select("name, owner_account_id, status")
      .eq("id", groupId as string)
      .single();
    expect(group?.name).toBe("Squad Alpha");
    expect(group?.owner_account_id).toBe(owner.accountId);
  });
});
