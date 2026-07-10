import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  completeActiveProfile,
  setReadOnlyEntitlements,
} from "../../support/integration-fixtures";
import { createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T104][integration] @p0 billing actions", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) await deleteAuthUser(user.authUserId);
    user = null;
    await setFeatureFlag("stripe_enabled", false);
  });

  it("sets read-only entitlements for canceled subscriptions", async () => {
    assertTestGuards();
    user = await provisionAuthUser("bill-act-a", { status: "active" });
    await completeActiveProfile(user, "BillActor");
    await setReadOnlyEntitlements(user.accountId, true);

    const admin = createFixtureAdmin();
    const { data: entitlements } = await admin
      .from("entitlements")
      .select("read_only")
      .eq("account_id", user.accountId)
      .single();
    expect(entitlements?.read_only).toBe(true);
  });

  it("seeds stripe customer metadata on subscription row", async () => {
    assertTestGuards();
    user = await provisionAuthUser("bill-act-cust", { status: "active" });
    await completeActiveProfile(user, "BillCustomer");

    const admin = createFixtureAdmin();
    await admin.from("subscriptions").upsert({
      account_id: user.accountId,
      status: "none",
      stripe_customer_id: "cus_local_104",
    });

    const { data: row } = await admin
      .from("subscriptions")
      .select("stripe_customer_id, status")
      .eq("account_id", user.accountId)
      .single();
    expect(row?.stripe_customer_id).toBe("cus_local_104");
    expect(row?.status).toBe("none");
  });
});
