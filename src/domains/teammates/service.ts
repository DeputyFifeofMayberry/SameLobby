import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/analytics/events";

export async function recordTeammateIntentFromSession(
  sessionId: string,
  accountId: string,
): Promise<{ matched: boolean }> {
  const supabase = await createClient();
  const { data: matched, error } = await supabase.rpc("record_teammate_intent", {
    p_session_id: sessionId,
  });

  if (error) return { matched: false };

  if (matched === true) {
    trackEvent("teammate_added");
    revalidatePath("/teammates");
  }

  void accountId;
  return { matched: matched === true };
}
