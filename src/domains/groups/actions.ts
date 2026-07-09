"use server";

import { revalidatePath } from "next/cache";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { createGroupSchema } from "@/domains/groups/schemas";
import { createClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics/events";
import type { Account } from "@/domains/accounts/types";

export type ActionResult = { ok: true; groupId?: string } | { ok: false; error: string };

type GroupAccountContext =
  | { ok: false; error: string }
  | { ok: true; account: Account };

async function requireGroupAccount(): Promise<GroupAccountContext> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };
  if (account.status !== "active") {
    return { ok: false, error: "Complete attestation before continuing." };
  }
  const enabled = await isFeatureEnabled("private_groups_enabled");
  if (!enabled) {
    return { ok: false, error: "Private groups are not enabled yet." };
  }
  return { ok: true, account };
}

function firstZodError(parsed: {
  success: false;
  error: { issues: { message?: string }[] };
}): string {
  return parsed.error.issues[0]?.message ?? "Invalid form";
}

export async function createPrivateGroup(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireGroupAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const inviteeIds = formData.getAll("inviteeIds").map((v) => v.toString());

  const parsed = createGroupSchema.safeParse({
    name: formData.get("name"),
    sizeGoal: formData.get("sizeGoal"),
    emblemKey: formData.get("emblemKey")?.toString() ?? "",
    sharedGameId: formData.get("sharedGameId")?.toString() ?? "",
    inviteeIds,
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const supabase = await createClient();
  const { data: groupId, error } = await supabase.rpc("create_private_group", {
    p_name: parsed.data.name,
    p_size_goal: parsed.data.sizeGoal,
    p_emblem_key: parsed.data.emblemKey || null,
    p_shared_game_id: parsed.data.sharedGameId || null,
  });

  if (error) {
    const message = error.message.includes("free group limit")
      ? "You already have an active private group on the free plan."
      : "Could not create group.";
    return { ok: false, error: message };
  }

  for (const inviteeId of parsed.data.inviteeIds ?? []) {
    await supabase.rpc("invite_to_group", {
      p_group_id: groupId,
      p_invitee_account_id: inviteeId,
    });
  }

  revalidatePath("/teammates");
  revalidatePath(`/groups/${groupId}`);
  return { ok: true, groupId: groupId as string };
}

export async function acceptGroupInvitation(
  invitationId: string,
): Promise<ActionResult> {
  const ctx = await requireGroupAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { data: activated, error } = await supabase.rpc("accept_group_invitation", {
    p_invitation_id: invitationId,
  });

  if (error) return { ok: false, error: "Could not accept invitation." };

  if (activated === true) {
    trackEvent("group_created");
  }

  revalidatePath("/teammates");
  return { ok: true };
}

export async function voteGroupInvitation(
  invitationId: string,
  approved: boolean,
): Promise<ActionResult> {
  const ctx = await requireGroupAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { data: activated, error } = await supabase.rpc("vote_group_invitation", {
    p_invitation_id: invitationId,
    p_approved: approved,
  });

  if (error) return { ok: false, error: "Could not record vote." };

  if (activated === true) {
    trackEvent("group_created");
    const { data: inv } = await supabase
      .from("group_invitations")
      .select("group_id")
      .eq("id", invitationId)
      .maybeSingle();
    if (inv?.group_id) {
      await supabase.rpc("create_conversation_for_group", {
        p_group_id: inv.group_id,
      });
    }
  }

  revalidatePath("/teammates");
  return { ok: true };
}

export async function ensureGroupConversation(groupId: string): Promise<string | null> {
  const ctx = await requireGroupAccount();
  if (!ctx.ok) return null;

  const supabase = await createClient();
  const { data } = await supabase.rpc("create_conversation_for_group", {
    p_group_id: groupId,
  });
  return (data as string) ?? null;
}

export async function createOpenSeat(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireGroupAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const groupId = formData.get("groupId")?.toString();
  const unavailableAccountId = formData.get("unavailableAccountId")?.toString();
  const kind = formData.get("kind")?.toString();

  if (!groupId || !unavailableAccountId || !kind) {
    return { ok: false, error: "Invalid form." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("group_open_seats").insert({
    group_id: groupId,
    created_by_account_id: ctx.account.id,
    unavailable_account_id: unavailableAccountId,
    kind,
    role_note: formData.get("roleNote")?.toString() || null,
    status: "open",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/groups/${groupId}`);
  return { ok: true };
}

export async function inviteToGroup(
  groupId: string,
  inviteeAccountId: string,
): Promise<ActionResult> {
  const ctx = await requireGroupAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("invite_to_group", {
    p_group_id: groupId,
    p_invitee_account_id: inviteeAccountId,
  });

  if (error) return { ok: false, error: "Could not send invitation." };

  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/teammates");
  return { ok: true };
}
