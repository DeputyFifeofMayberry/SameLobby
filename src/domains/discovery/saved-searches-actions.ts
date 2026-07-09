"use server";

import { revalidatePath } from "next/cache";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { requireWritableAccount } from "@/domains/billing/entitlements";
import { savedSearchSchema } from "@/domains/billing/schemas";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

function firstZodError(parsed: {
  success: false;
  error: { issues: { message?: string }[] };
}): string {
  return parsed.error.issues[0]?.message ?? "Invalid form";
}

export async function saveSavedSearch(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };
  if (account.status !== "active") {
    return { ok: false, error: "Complete attestation before continuing." };
  }

  const writable = await requireWritableAccount(account.id);
  if (!writable.ok) return { ok: false, error: writable.error };

  const parsed = savedSearchSchema.safeParse({
    name: formData.get("name"),
    filters: {
      q: formData.get("q")?.toString() || undefined,
      gameId: formData.get("gameId")?.toString() || undefined,
      platformId: formData.get("platformId")?.toString() || undefined,
      goal: formData.get("goal")?.toString() || undefined,
    },
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("upsert_saved_search", {
    p_name: parsed.data.name,
    p_filters: parsed.data.filters,
  });

  if (error) {
    const message = error.message.includes("saved search limit")
      ? "Saved searches are a Plus feature."
      : "Could not save search.";
    return { ok: false, error: message };
  }

  revalidatePath("/discover/search");
  revalidatePath("/subscription");
  return { ok: true };
}

export async function deleteSavedSearch(
  searchId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };

  const writable = await requireWritableAccount(account.id);
  if (!writable.ok) return { ok: false, error: writable.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", searchId)
    .eq("account_id", account.id);

  if (error) return { ok: false, error: "Could not delete saved search." };

  revalidatePath("/discover/search");
  revalidatePath("/subscription");
  return { ok: true };
}
