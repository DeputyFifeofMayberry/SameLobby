import "server-only";
import { createClient } from "@/lib/supabase/server";

export type FeatureFlagKey =
  | "registration_open"
  | "connection_requests_enabled"
  | "messaging_enabled"
  | "discovery_enabled"
  | "stripe_enabled"
  | "links_in_messages";

export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feature_flags")
    .select("enabled")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return data.enabled === true;
}
