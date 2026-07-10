import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/admin", async () => {
  const { createFixtureAdmin } = await import("../../support/supabase");
  return {
    createAdminClient: () => createFixtureAdmin(),
  };
});

import { assertTestGuards } from "../../support/guards";
import { completeActiveProfile } from "../../support/integration-fixtures";
import { createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T101][integration] @p0 billing webhooks", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) await deleteAuthUser(user.authUserId);
    user = null;
  });

  it("activates subscription state from customer.subscription.updated", async () => {
    assertTestGuards();
    user = await provisionAuthUser("bill-webhook", { status: "active" });
    await completeActiveProfile(user, "BillWebhook");

    const admin = createFixtureAdmin();
    await admin.from("subscriptions").upsert({
      account_id: user.accountId,
      status: "none",
      stripe_customer_id: "cus_test_101",
    });

    const { processStripeEvent } = await import("@/domains/billing/webhook");
    await processStripeEvent({
      id: `evt_sub_101_${randomUUID()}`,
      type: "customer.subscription.updated",
      livemode: false,
      data: {
        object: {
          id: "sub_test_101",
          status: "active",
          metadata: { account_id: user.accountId },
          customer: "cus_test_101",
          current_period_end: Math.floor(Date.now() / 1000) + 86400,
          cancel_at_period_end: false,
          items: { data: [{ price: { id: "price_test" } }] },
        },
      },
    } as never);

    const { data: subscription } = await admin
      .from("subscriptions")
      .select("status, stripe_subscription_id")
      .eq("account_id", user.accountId)
      .single();
    expect(subscription?.status).toBe("active");
    expect(subscription?.stripe_subscription_id).toBe("sub_test_101");
  });
});
