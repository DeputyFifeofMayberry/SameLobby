import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { FREE_LIMITS } from "@/domains/billing/constants";
import type { Entitlements } from "@/domains/billing/types";

const DEFAULT_ENTITLEMENTS: Omit<Entitlements, "accountId"> = {
  tier: "free",
  maxActiveGames: FREE_LIMITS.maxActiveGames,
  maxActiveGroupsOwned: FREE_LIMITS.maxActiveGroupsOwned,
  maxSavedSearches: FREE_LIMITS.maxSavedSearches,
  readOnly: false,
};

function mapRow(row: {
  account_id: string;
  tier: string;
  max_active_games: number;
  max_active_groups_owned: number;
  max_saved_searches: number;
  read_only: boolean;
}): Entitlements {
  return {
    accountId: row.account_id,
    tier: row.tier as Entitlements["tier"],
    maxActiveGames: row.max_active_games,
    maxActiveGroupsOwned: row.max_active_groups_owned,
    maxSavedSearches: row.max_saved_searches,
    readOnly: row.read_only,
  };
}

export async function getEntitlements(
  accountId: string,
): Promise<Entitlements> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entitlements")
    .select("*")
    .eq("account_id", accountId)
    .maybeSingle();

  if (!data) {
    return { accountId, ...DEFAULT_ENTITLEMENTS };
  }

  return mapRow(data as Parameters<typeof mapRow>[0]);
}

export async function requireWritableAccount(
  accountId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const entitlements = await getEntitlements(accountId);
  if (entitlements.readOnly) {
    return {
      ok: false,
      error:
        "Your Plus subscription ended. You can still read messages and connections, but new actions are paused until you resubscribe.",
    };
  }
  return { ok: true };
}

export async function getOrCreateStripeCustomer(
  accountId: string,
  email: string,
): Promise<string> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("account_id", accountId)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id as string;
  }

  const { getStripeClient } = await import("@/domains/billing/stripe");
  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email,
    metadata: { account_id: accountId },
  });

  await admin.from("subscriptions").upsert({
    account_id: accountId,
    stripe_customer_id: customer.id,
    status: "none",
  });

  return customer.id;
}

export async function recomputeEntitlements(accountId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("recompute_entitlements", {
    p_account_id: accountId,
  });
  if (error) throw error;
}
