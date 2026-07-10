import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import {
  completeActiveProfile,
  grantAdminScopes,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient, createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T095][integration] @p1 admin feature controls", () => {
  let adminUser: ProvisionedUser | null = null;
  let outsider: ProvisionedUser | null = null;

  afterEach(async () => {
    if (adminUser) await deleteAuthUser(adminUser.authUserId);
    if (outsider) await deleteAuthUser(outsider.authUserId);
    adminUser = null;
    outsider = null;
  });

  it("allows admins to read feature_flags and updates via service role harness", async () => {
    assertTestGuards();
    adminUser = await provisionAuthUser("feature-admin", { status: "active" });
    outsider = await provisionAuthUser("feature-outsider", { status: "active" });
    await completeActiveProfile(adminUser, "FeatureAdmin");
    await completeActiveProfile(outsider, "FeatureOutsider");
    await grantAdminScopes(adminUser.accountId, ["security_break_glass"]);

    const adminSession = await signInProvisionedUser(adminUser);
    const adminActor = await createActorClient(adminSession);
    const { data: flags, error: readError } = await adminActor
      .from("feature_flags")
      .select("key, enabled")
      .eq("key", "registration_open");
    expect(readError).toBeNull();
    expect((flags ?? []).length).toBe(1);

    const fixtureAdmin = createFixtureAdmin();
    const nextEnabled = !(flags?.[0]?.enabled ?? false);
    const { error: updateError } = await fixtureAdmin
      .from("feature_flags")
      .update({ enabled: nextEnabled })
      .eq("key", "registration_open");
    expect(updateError).toBeNull();

    const outsiderSession = await signInProvisionedUser(outsider);
    const outsiderActor = await createActorClient(outsiderSession);
    const { error: deniedUpdate } = await outsiderActor
      .from("feature_flags")
      .update({ enabled: true })
      .eq("key", "registration_open");
    expect(deniedUpdate).toBeTruthy();

    const { data: updated } = await adminActor
      .from("feature_flags")
      .select("enabled")
      .eq("key", "registration_open")
      .single();
    expect(updated?.enabled).toBe(nextEnabled);
  });
});
