import { createFixtureAdmin } from "./supabase";

export async function setFeatureFlag(key: string, enabled: boolean): Promise<void> {
  const { error } = await createFixtureAdmin()
    .from("feature_flags")
    .update({ enabled })
    .eq("key", key);
  if (error) throw error;
}
