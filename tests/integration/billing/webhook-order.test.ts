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

describe("[SL-T102][integration] @p0 billing webhook order", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) await deleteAuthUser(user.authUserId);
    user = null;
  });

  it("applies later subscription.updated after initial activation", async () => {
    assertTestGuards();
    user = await provisionAuthUser("bill-order", { status: "active" });
    await completeActiveProfile(user, "BillOrder");

    const admin = createFixtureAdmin();
    await admin.from("subscriptions").upsert({
      account_id: user.accountId,
      status: "none",
      stripe_customer_id: "cus_test_102",
    });

    const baseSubscription = {
      id: "sub_test_102",
      status: "active",
      metadata: { account_id: user.accountId },
      customer: "cus_test_102",
      current_period_end: Math.floor(Date.now() / 1000) + 86400,
      cancel_at_period_end: false,
      items: { data: [{ price: { id: "price_test" } }] },
    };

    const { processStripeEvent } = await import("@/domains/billing/webhook");

    await processStripeEvent({
      id: `evt_sub_created_102_${randomUUID()}`,
      type: "customer.subscription.updated",
      livemode: false,
      data: { object: baseSubscription },
    } as never);

    await processStripeEvent({
      id: `evt_sub_cancel_flag_102_${randomUUID()}`,
      type: "customer.subscription.updated",
      livemode: false,
      data: {
        object: {
          ...baseSubscription,
          cancel_at_period_end: true,
        },
      },
    } as never);

    const { data: subscription } = await admin
      .from("subscriptions")
      .select("status, cancel_at_period_end")
      .eq("account_id", user.accountId)
      .single();
    expect(subscription?.status).toBe("cancel_at_period_end");
    expect(subscription?.cancel_at_period_end).toBe(true);
  });
});
