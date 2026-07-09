"use server";

import { revalidatePath } from "next/cache";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { requireWritableAccount } from "@/domains/billing/entitlements";
import { orderedPair } from "@/domains/connections/helpers";
import { hasBlockBetween } from "@/domains/connections/queries";
import { createTeammateProposalNotification } from "@/domains/notifications/service";
import { recordTeammateIntentFromSession as recordIntentService } from "@/domains/teammates/service";
import {
  proposeTeammateSchema,
  saveTeammateNoteSchema,
} from "@/domains/teammates/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics/events";
import type { Account } from "@/domains/accounts/types";

export type ActionResult =
  { ok: true; matched?: boolean } | { ok: false; error: string };

type TeammateAccountContext =
  { ok: false; error: string } | { ok: true; account: Account };

async function requireTeammateAccount(): Promise<TeammateAccountContext> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };
  if (account.status !== "active") {
    return { ok: false, error: "Complete attestation before continuing." };
  }
  const writable = await requireWritableAccount(account.id);
  if (!writable.ok) return { ok: false, error: writable.error };
  const enabled = await isFeatureEnabled("teammates_enabled");
  if (!enabled) {
    return { ok: false, error: "Teammates are not enabled yet." };
  }
  return { ok: true, account };
}

function firstZodError(parsed: {
  success: false;
  error: { issues: { message?: string }[] };
}): string {
  return parsed.error.issues[0]?.message ?? "Invalid form";
}

export async function recordTeammateIntentFromSession(
  sessionId: string,
): Promise<{ matched: boolean }> {
  const ctx = await requireTeammateAccount();
  if (!ctx.ok) return { matched: false };
  return recordIntentService(sessionId, ctx.account.id);
}

export async function proposeTeammate(
  otherAccountId: string,
): Promise<ActionResult> {
  const ctx = await requireTeammateAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = proposeTeammateSchema.safeParse({ otherAccountId });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  if (await hasBlockBetween(ctx.account.id, otherAccountId)) {
    return { ok: false, error: "This request cannot be sent." };
  }

  const supabase = await createClient();
  const { data: relationshipId, error } = await supabase.rpc(
    "propose_teammate",
    {
      p_other_account_id: otherAccountId,
    },
  );

  if (error) {
    const message = error.message.includes("no completed session")
      ? "Play together at least once before becoming teammates."
      : error.message.includes("blocked")
        ? "This request cannot be sent."
        : "Could not send teammate request.";
    return { ok: false, error: message };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("gamer_profiles")
    .select("display_name")
    .eq("account_id", ctx.account.id)
    .maybeSingle();

  await createTeammateProposalNotification({
    recipientAccountId: otherAccountId,
    proposerDisplayName: (profile?.display_name as string) ?? "A connection",
  });

  revalidatePath("/teammates");
  return { ok: true, matched: false };
}

export async function affirmTeammateProposal(
  relationshipId: string,
): Promise<ActionResult> {
  const ctx = await requireTeammateAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { data: matched, error } = await supabase.rpc(
    "affirm_teammate_proposal",
    {
      p_relationship_id: relationshipId,
    },
  );

  if (error) return { ok: false, error: "Could not affirm request." };

  if (matched === true) {
    trackEvent("teammate_added");
  }

  revalidatePath("/teammates");
  revalidatePath(`/teammates/${relationshipId}`);
  return { ok: true, matched: matched === true };
}

export async function endTeammateRelationship(
  relationshipId: string,
): Promise<ActionResult> {
  const ctx = await requireTeammateAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("end_teammate_relationship", {
    p_relationship_id: relationshipId,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/teammates");
  return { ok: true };
}

export async function promoteRegularTeammate(
  relationshipId: string,
): Promise<ActionResult> {
  const ctx = await requireTeammateAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("promote_regular_teammate", {
    p_relationship_id: relationshipId,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/teammates");
  revalidatePath(`/teammates/${relationshipId}`);
  return { ok: true };
}

export async function saveTeammateNote(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireTeammateAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = saveTeammateNoteSchema.safeParse({
    relationshipId: formData.get("relationshipId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("teammate_notes").upsert(
    {
      account_id: ctx.account.id,
      relationship_id: parsed.data.relationshipId,
      body: parsed.data.body,
    },
    { onConflict: "account_id,relationship_id" },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/teammates/${parsed.data.relationshipId}`);
  return { ok: true };
}
