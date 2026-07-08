import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  CurrentIntent,
  DisclosureSetting,
  GamerProfile,
} from "@/domains/profile/types";

export async function getGamerProfileForAccount(
  accountId: string,
): Promise<GamerProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gamer_profiles")
    .select("*")
    .eq("account_id", accountId)
    .maybeSingle();

  if (error || !data) return null;
  return data as GamerProfile;
}

export async function getDisclosureSettings(
  accountId: string,
): Promise<DisclosureSetting[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("disclosure_settings")
    .select("*")
    .eq("account_id", accountId);

  if (error || !data) return [];
  return data as DisclosureSetting[];
}

export async function getCurrentIntent(
  accountId: string,
): Promise<CurrentIntent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("current_intents")
    .select("*")
    .eq("account_id", accountId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as CurrentIntent;
}

export async function getProfileBundleForAccount(accountId: string) {
  const [profile, disclosureSettings, currentIntent] = await Promise.all([
    getGamerProfileForAccount(accountId),
    getDisclosureSettings(accountId),
    getCurrentIntent(accountId),
  ]);

  return { profile, disclosureSettings, currentIntent };
}
