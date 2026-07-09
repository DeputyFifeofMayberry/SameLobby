"use server";

import { redirect } from "next/navigation";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import {
  getOrCreateStripeCustomer,
  requireWritableAccount,
} from "@/domains/billing/entitlements";
import {
  checkoutPlanSchema,
  billingReauthSchema,
} from "@/domains/billing/schemas";
import { getStripeClient, getStripePriceId } from "@/domains/billing/stripe";
import { trackEvent } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type BillingActionResult =
  { ok: true; url?: string } | { ok: false; error: string };

async function verifyPassword(password: string): Promise<boolean> {
  const user = await getSessionUser();
  if (!user?.email) return false;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });
  return !error;
}

export async function createCheckoutSession(
  planKey: "plus_monthly" | "plus_annual",
  password: string,
): Promise<BillingActionResult> {
  const enabled = await isFeatureEnabled("stripe_enabled");
  if (!enabled) {
    return { ok: false, error: "Subscriptions are not enabled yet." };
  }

  const parsedPlan = checkoutPlanSchema.safeParse(planKey);
  if (!parsedPlan.success) {
    return { ok: false, error: "Invalid plan." };
  }

  const parsedAuth = billingReauthSchema.safeParse({ password, planKey });
  if (!parsedAuth.success) {
    return { ok: false, error: "Password is required." };
  }

  if (!(await verifyPassword(password))) {
    return { ok: false, error: "Password verification failed." };
  }

  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };

  if (account.status === "suspended") {
    return {
      ok: false,
      error: "New subscriptions are not available for this account.",
    };
  }

  const writable = await requireWritableAccount(account.id);
  if (!writable.ok) return { ok: false, error: writable.error };

  const customerId = await getOrCreateStripeCustomer(account.id, account.email);
  const stripe = getStripeClient();
  const priceId = getStripePriceId(parsedPlan.data);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: account.id,
    metadata: { account_id: account.id },
    subscription_data: {
      metadata: { account_id: account.id },
    },
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_SITE_URL}/subscription?checkout=success`,
    cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/subscription?checkout=cancel`,
  });

  if (!session.url) {
    return { ok: false, error: "Could not start checkout." };
  }

  trackEvent("subscription_checkout_started", { plan: parsedPlan.data });
  return { ok: true, url: session.url };
}

export async function createPortalSession(
  password: string,
): Promise<BillingActionResult> {
  const enabled = await isFeatureEnabled("stripe_enabled");
  if (!enabled) {
    return { ok: false, error: "Subscriptions are not enabled yet." };
  }

  if (!password) {
    return { ok: false, error: "Password is required." };
  }

  if (!(await verifyPassword(password))) {
    return { ok: false, error: "Password verification failed." };
  }

  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };

  const customerId = await getOrCreateStripeCustomer(account.id, account.email);
  const stripe = getStripeClient();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.NEXT_PUBLIC_SITE_URL}/subscription`,
  });

  return { ok: true, url: session.url };
}

export async function redirectToCheckout(
  planKey: "plus_monthly" | "plus_annual",
  password: string,
): Promise<void> {
  const result = await createCheckoutSession(planKey, password);
  if (!result.ok) {
    redirect(`/subscription?error=${encodeURIComponent(result.error)}`);
  }
  if (!result.url) {
    redirect(
      `/subscription?error=${encodeURIComponent("Could not start checkout.")}`,
    );
  }
  redirect(result.url);
}

export async function redirectToPortal(password: string): Promise<void> {
  const result = await createPortalSession(password);
  if (!result.ok) {
    redirect(`/subscription?error=${encodeURIComponent(result.error)}`);
  }
  if (!result.url) {
    redirect(
      `/subscription?error=${encodeURIComponent("Could not open billing portal.")}`,
    );
  }
  redirect(result.url);
}
