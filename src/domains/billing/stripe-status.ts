import type Stripe from "stripe";
import type { SubscriptionStatus } from "@/domains/billing/types";

export function mapStripeStatus(
  subscription: Stripe.Subscription,
): SubscriptionStatus {
  if (subscription.status === "active" && subscription.cancel_at_period_end) {
    return "cancel_at_period_end";
  }
  if (subscription.status === "active" || subscription.status === "trialing") {
    return "active";
  }
  if (subscription.status === "past_due" || subscription.status === "unpaid") {
    return "past_due";
  }
  if (subscription.status === "canceled") {
    return "canceled";
  }
  return "none";
}
