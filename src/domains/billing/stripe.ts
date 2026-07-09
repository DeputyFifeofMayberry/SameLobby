import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function requireStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe is not configured.");
  }
  return key;
}

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(requireStripeSecretKey(), {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Stripe webhook secret is not configured.");
  }
  return secret;
}

export function getStripePriceId(
  planKey: "plus_monthly" | "plus_annual",
): string {
  const envKey =
    planKey === "plus_monthly"
      ? process.env.STRIPE_PRICE_PLUS_MONTHLY
      : process.env.STRIPE_PRICE_PLUS_ANNUAL;
  if (!envKey) {
    throw new Error(`Stripe price for ${planKey} is not configured.`);
  }
  return envKey;
}
