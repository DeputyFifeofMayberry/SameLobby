import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SavedSearch, SubscriptionRow } from "@/domains/billing/types";

export async function getSubscriptionForAccount(
  accountId: string,
): Promise<SubscriptionRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "account_id, stripe_customer_id, stripe_subscription_id, status, plan_key, current_period_end, cancel_at_period_end, past_due_since",
    )
    .eq("account_id", accountId)
    .maybeSingle();

  if (!data) return null;

  return {
    account_id: data.account_id as string,
    stripe_customer_id: (data.stripe_customer_id as string | null) ?? null,
    stripe_subscription_id:
      (data.stripe_subscription_id as string | null) ?? null,
    status: data.status as SubscriptionRow["status"],
    plan_key: (data.plan_key as string | null) ?? null,
    current_period_end: (data.current_period_end as string | null) ?? null,
    cancel_at_period_end: Boolean(data.cancel_at_period_end),
    past_due_since: (data.past_due_since as string | null) ?? null,
  };
}

export async function listSavedSearches(
  accountId: string,
): Promise<SavedSearch[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_searches")
    .select("id, name, filters, created_at")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    filters: (row.filters as SavedSearch["filters"]) ?? {},
    createdAt: row.created_at as string,
  }));
}

export async function countActiveGamesForAccount(
  accountId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("user_games")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId)
    .eq("is_active", true);
  return count ?? 0;
}

export async function countOwnedGroupsFormingOrActive(
  accountId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("private_groups")
    .select("id", { count: "exact", head: true })
    .eq("owner_account_id", accountId)
    .in("status", ["forming", "active"]);
  return count ?? 0;
}
