import { describe, expect, it } from "vitest";
import { mapStripeStatus } from "@/domains/billing/stripe-status";
import type Stripe from "stripe";

function sub(partial: Partial<Stripe.Subscription>): Stripe.Subscription {
  return {
    status: "active",
    cancel_at_period_end: false,
    ...partial,
  } as Stripe.Subscription;
}

describe("mapStripeStatus", () => {
  it("maps active subscription", () => {
    expect(mapStripeStatus(sub({ status: "active" }))).toBe("active");
    expect(mapStripeStatus(sub({ status: "trialing" }))).toBe("active");
  });

  it("maps cancel at period end", () => {
    expect(
      mapStripeStatus(sub({ status: "active", cancel_at_period_end: true })),
    ).toBe("cancel_at_period_end");
  });

  it("maps past due states", () => {
    expect(mapStripeStatus(sub({ status: "past_due" }))).toBe("past_due");
    expect(mapStripeStatus(sub({ status: "unpaid" }))).toBe("past_due");
  });

  it("maps canceled", () => {
    expect(mapStripeStatus(sub({ status: "canceled" }))).toBe("canceled");
  });

  it("defaults unknown to none", () => {
    expect(mapStripeStatus(sub({ status: "incomplete" }))).toBe("none");
  });
});
