import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { recomputeEntitlements } from "@/domains/billing/entitlements";
import { mapStripeStatus } from "@/domains/billing/stripe-status";
import { trackEvent } from "@/lib/analytics/events";

async function upsertSubscriptionFromStripe(
  accountId: string,
  subscription: Stripe.Subscription,
  customerId: string,
): Promise<void> {
  const admin = createAdminClient();
  const status = mapStripeStatus(subscription);
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const { data: existing, error: existingError } = await admin
    .from("subscriptions")
    .select("past_due_since")
    .eq("account_id", accountId)
    .maybeSingle();
  if (existingError) throw existingError;

  let pastDueSince: string | null =
    (existing?.past_due_since as string | null) ?? null;
  if (status === "past_due" && !pastDueSince) {
    pastDueSince = new Date().toISOString();
  } else if (status === "active" || status === "cancel_at_period_end") {
    pastDueSince = null;
  }

  const priceId = subscription.items.data[0]?.price.id ?? null;
  let planKey: string | null = null;
  if (priceId) {
    const { data: plan, error: planError } = await admin
      .from("plans")
      .select("key")
      .eq("stripe_price_id", priceId)
      .maybeSingle();
    if (planError) throw planError;
    planKey = (plan?.key as string) ?? null;
  }

  const { error: upsertError } = await admin.from("subscriptions").upsert({
    account_id: accountId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status,
    plan_key: planKey,
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    past_due_since: pastDueSince,
  });
  if (upsertError) throw upsertError;

  await recomputeEntitlements(accountId);
}

export async function processStripeEvent(event: Stripe.Event): Promise<void> {
  const admin = createAdminClient();

  const { error: insertError } = await admin
    .from("stripe_webhook_events")
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      metadata: { livemode: event.livemode },
    });

  if (insertError?.code === "23505") {
    return;
  }
  if (insertError) {
    throw insertError;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const accountId =
          session.metadata?.account_id ?? session.client_reference_id ?? null;
        if (!accountId || !session.subscription) return;

        const { getStripeClient } = await import("@/domains/billing/stripe");
        const stripe = getStripeClient();
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        if (!customerId) return;

        await upsertSubscriptionFromStripe(accountId, subscription, customerId);
        trackEvent("subscription_active", {
          plan: subscription.items.data[0]?.price.id ?? "unknown",
        });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const accountId = subscription.metadata?.account_id;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;
        if (!accountId || !customerId) return;
        await upsertSubscriptionFromStripe(accountId, subscription, customerId);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const accountId = subscription.metadata?.account_id;
        if (!accountId) return;

        const { error: updateError } = await admin
          .from("subscriptions")
          .update({
            status: "canceled",
            stripe_subscription_id: null,
            cancel_at_period_end: false,
          })
          .eq("account_id", accountId);
        if (updateError) throw updateError;

        await recomputeEntitlements(accountId);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        if (!subscriptionId) return;

        const { data: row, error: rowError } = await admin
          .from("subscriptions")
          .select("account_id, past_due_since")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();
        if (rowError) throw rowError;

        if (!row) return;

        const { error: updateError } = await admin
          .from("subscriptions")
          .update({
            status: "past_due",
            past_due_since:
              (row.past_due_since as string) ?? new Date().toISOString(),
          })
          .eq("account_id", row.account_id as string);
        if (updateError) throw updateError;

        await recomputeEntitlements(row.account_id as string);
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        if (!subscriptionId) return;

        const { data: row, error: rowError } = await admin
          .from("subscriptions")
          .select("account_id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();
        if (rowError) throw rowError;

        if (!row) return;

        const { error: updateError } = await admin
          .from("subscriptions")
          .update({
            status: "active",
            past_due_since: null,
          })
          .eq("account_id", row.account_id as string);
        if (updateError) throw updateError;

        await recomputeEntitlements(row.account_id as string);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    await admin
      .from("stripe_webhook_events")
      .delete()
      .eq("stripe_event_id", event.id);
    throw error;
  }
}

export async function cancelStripeSubscriptionForAccount(
  accountId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("account_id", accountId)
    .maybeSingle();

  const subId = row?.stripe_subscription_id as string | null;
  if (!subId) return;

  const { getStripeClient } = await import("@/domains/billing/stripe");
  const stripe = getStripeClient();
  await stripe.subscriptions.cancel(subId);

  await admin
    .from("subscriptions")
    .update({
      status: "canceled",
      stripe_subscription_id: null,
    })
    .eq("account_id", accountId);

  await recomputeEntitlements(accountId);
}
