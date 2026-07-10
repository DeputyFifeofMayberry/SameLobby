import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { completeActiveProfile } from "../../support/integration-fixtures";
import { createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";
import { FREE_LIMITS, PLUS_LIMITS } from "@/domains/billing/constants";

describe("[SL-T106][integration] @p1 billing entitlements", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) await deleteAuthUser(user.authUserId);
    user = null;
  });

  it("recomputes free-tier limits for active accounts", async () => {
    assertTestGuards();
    user = await provisionAuthUser("ent-free", { status: "active" });
    await completeActiveProfile(user, "EntFree");

    const admin = createFixtureAdmin();
    const { error } = await admin.rpc("recompute_entitlements", {
      p_account_id: user.accountId,
    });
    expect(error).toBeNull();

    const { data: entitlements } = await admin
      .from("entitlements")
      .select("tier, max_active_games, max_active_groups_owned, max_saved_searches, read_only")
      .eq("account_id", user.accountId)
      .single();
    expect(entitlements?.tier).toBe("free");
    expect(entitlements?.max_active_games).toBe(FREE_LIMITS.maxActiveGames);
    expect(entitlements?.max_active_groups_owned).toBe(
      FREE_LIMITS.maxActiveGroupsOwned,
    );
    expect(entitlements?.max_saved_searches).toBe(FREE_LIMITS.maxSavedSearches);
    expect(entitlements?.read_only).toBe(false);
  });

  it("applies plus limits when a subscription is active", async () => {
    assertTestGuards();
    user = await provisionAuthUser("ent-plus", { status: "active" });
    await completeActiveProfile(user, "EntPlus");

    const admin = createFixtureAdmin();
    await admin.from("subscriptions").upsert({
      account_id: user.accountId,
      status: "active",
      stripe_customer_id: "cus_test_plus",
      stripe_subscription_id: "sub_test_plus",
      cancel_at_period_end: false,
      past_due_since: null,
    });
    const { error } = await admin.rpc("recompute_entitlements", {
      p_account_id: user.accountId,
    });
    expect(error).toBeNull();

    const { data: entitlements } = await admin
      .from("entitlements")
      .select("tier, max_active_games, max_saved_searches")
      .eq("account_id", user.accountId)
      .single();
    expect(entitlements?.tier).toBe("plus");
    expect(entitlements?.max_active_games).toBe(PLUS_LIMITS.maxActiveGames);
    expect(entitlements?.max_saved_searches).toBe(PLUS_LIMITS.maxSavedSearches);
  });
});
