import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { completeActiveProfile, setReadOnlyEntitlements } from "../../support/integration-fixtures";
import { createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T103][integration] @p0 billing resubscribe", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) await deleteAuthUser(user.authUserId);
    user = null;
  });

  it("marks canceled accounts read-only while allowing resubscribe checkout (Q17)", async () => {
    assertTestGuards();
    user = await provisionAuthUser("bill-resub", {
      status: "active",
      password: "TestPass123!",
    });
    await completeActiveProfile(user, "BillResub");
    await setReadOnlyEntitlements(user.accountId, true);

    const admin = createFixtureAdmin();
    const { data: entitlements } = await admin
      .from("entitlements")
      .select("read_only, tier")
      .eq("account_id", user.accountId)
      .single();
    expect(entitlements?.read_only).toBe(true);
    expect(entitlements?.tier).toBe("free");

    const billingActions = await import("@/domains/billing/actions");
    expect(billingActions.createCheckoutSession.toString()).not.toContain(
      "requireWritableAccount",
    );
  });
});
