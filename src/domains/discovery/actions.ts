"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { requireWritableAccount } from "@/domains/billing/entitlements";
import {
  getCohortSnapshot,
  refreshRecommendations,
} from "@/domains/discovery/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";
import type { IntentGoal } from "@/domains/profile/types";

import type { Account } from "@/domains/accounts/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

type DiscoveryAccountContext =
  { ok: false; error: string } | { ok: true; account: Account };

async function requireActiveDiscoveryAccount(): Promise<DiscoveryAccountContext> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };
  if (account.status !== "active") {
    return { ok: false, error: "Complete attestation before using discovery." };
  }
  const writable = await requireWritableAccount(account.id);
  if (!writable.ok) return { ok: false, error: writable.error };
  const enabled = await isFeatureEnabled("discovery_enabled");
  if (!enabled) {
    return { ok: false, error: "Discovery is not enabled yet." };
  }
  return { ok: true, account };
}

export async function optInToDemand(
  _prev: ActionResult | null,
): Promise<ActionResult> {
  const ctx = await requireActiveDiscoveryAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const cohort = await getCohortSnapshot(ctx.account.id);
  if (!cohort) return { ok: false, error: "Complete your profile first." };

  const supabase = await createClient();
  const { error } = await supabase.from("demand_signals").upsert(
    {
      account_id: ctx.account.id,
      cohort_key: cohort.cohortKey,
    },
    { onConflict: "account_id,cohort_key" },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/discover");
  return { ok: true };
}

export async function setDiscoveryPaused(
  paused: boolean,
): Promise<ActionResult> {
  const ctx = await requireActiveDiscoveryAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("gamer_profiles")
    .update({
      discovery_paused_at: paused ? new Date().toISOString() : null,
    })
    .eq("account_id", ctx.account.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/discover");
  revalidatePath("/profile");
  return { ok: true };
}

export async function refreshDiscoverRecommendations(): Promise<ActionResult> {
  const ctx = await requireActiveDiscoveryAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const cohort = await getCohortSnapshot(ctx.account.id);
  if (!cohort) return { ok: false, error: "Complete your profile first." };

  if (cohort.status !== "active_discovery") {
    return { ok: false, error: "Discovery is not active in your cohort yet." };
  }

  await refreshRecommendations(ctx.account.id);
  revalidatePath("/discover");
  return { ok: true };
}

export async function searchDiscoveryAction(filters: {
  gameId?: string;
  platformId?: string;
  goal?: IntentGoal;
  query?: string;
}) {
  const ctx = await requireActiveDiscoveryAccount();
  if (!ctx.ok) return { error: ctx.error, results: [] as const };

  const { searchDiscoverableProfiles } =
    await import("@/domains/discovery/queries");
  const results = await searchDiscoverableProfiles(ctx.account.id, filters);
  return { results, error: null };
}
