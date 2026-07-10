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

describe("[SL-T035][integration] @p1 discovery pause", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) await deleteAuthUser(user.authUserId);
    user = null;
    await setFeatureFlag("discovery_enabled", false);
  });

  it("sets discovery_paused_at on gamer_profiles via actor update", async () => {
    assertTestGuards();
    await setFeatureFlag("discovery_enabled", true);
    user = await provisionAuthUser("pause-user", { status: "active" });
    await completeActiveProfile(user, "PauseUser");

    const session = await signInProvisionedUser(user);
    const actor = await createActorClient(session);
    const pausedAt = new Date().toISOString();
    const { error } = await actor
      .from("gamer_profiles")
      .update({ discovery_paused_at: pausedAt })
      .eq("account_id", user.accountId);
    expect(error).toBeNull();

    const admin = createFixtureAdmin();
    const { data: profile } = await admin
      .from("gamer_profiles")
      .select("discovery_paused_at")
      .eq("account_id", user.accountId)
      .single();
    expect(profile?.discovery_paused_at).toBeTruthy();
  });
});
