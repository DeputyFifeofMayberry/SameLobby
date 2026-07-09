"use server";

import { revalidatePath } from "next/cache";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { createPlayInvitationNotification } from "@/domains/notifications/service";
import { PLAY_INVITATION_TTL_DAYS } from "@/domains/play/constants";
import {
  acceptPlayInvitationSchema,
  bothParticipantsConfirmedOccurred,
  postPlayFeedbackSchema,
  proposePlayInvitationSchema,
} from "@/domains/play/schemas";
import { datetimeLocalToUtcIso } from "@/domains/play/timezone";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics/events";
import { recordTeammateIntentFromSession as recordIntent } from "@/domains/teammates/service";
import type { Account } from "@/domains/accounts/types";

export type ActionResult =
  | { ok: true; sessionId?: string }
  | { ok: false; error: string };

type PlayAccountContext =
  | { ok: false; error: string }
  | { ok: true; account: Account };

async function requirePlayAccount(): Promise<PlayAccountContext> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };
  if (account.status !== "active") {
    return { ok: false, error: "Complete attestation before continuing." };
  }
  const enabled = await isFeatureEnabled("play_invitations_enabled");
  if (!enabled) {
    return { ok: false, error: "Play invitations are not enabled yet." };
  }
  return { ok: true, account };
}

function firstZodError(parsed: {
  success: false;
  error: { issues: { message?: string }[] };
}): string {
  return parsed.error.issues[0]?.message ?? "Invalid form";
}

export async function proposePlayInvitation(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requirePlayAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const timeSlots = formData.getAll("timeSlots").map((v) => v.toString());

  const parsed = proposePlayInvitationSchema.safeParse({
    conversationId: formData.get("conversationId"),
    recipientAccountId: formData.get("recipientAccountId"),
    gameId: formData.get("gameId"),
    platformId: formData.get("platformId"),
    schedulingMode: formData.get("schedulingMode"),
    sessionLengthMinutes: formData.get("sessionLengthMinutes"),
    voicePreferred: formData.get("voicePreferred") === "on",
    note: formData.get("note")?.toString() ?? "",
    timeSlots,
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const data = parsed.data;
  const proposerTz = ctx.account.time_zone ?? "America/Los_Angeles";

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + PLAY_INVITATION_TTL_DAYS);

  const supabase = await createClient();
  const { data: invitation, error: invError } = await supabase
    .from("play_invitations")
    .insert({
      conversation_id: data.conversationId,
      proposer_account_id: ctx.account.id,
      recipient_account_id: data.recipientAccountId,
      game_id: data.gameId,
      platform_id: data.platformId,
      scheduling_mode: data.schedulingMode,
      session_length_minutes: data.sessionLengthMinutes,
      voice_preferred: data.voicePreferred ?? false,
      note: data.note && data.note.length > 0 ? data.note : null,
      status: "proposed",
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (invError || !invitation) {
    return { ok: false, error: invError?.message ?? "Could not send invitation." };
  }

  if (data.schedulingMode === "scheduled") {
    const slots = (data.timeSlots ?? []).filter((s) => s.trim().length > 0);
    const rows = slots
      .map((slot, index) => {
        const utcIso = datetimeLocalToUtcIso(slot, proposerTz);
        if (!utcIso) return null;
        return {
          invitation_id: invitation.id,
          proposed_start_at: utcIso,
          sort_order: index,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (rows.length === 0) {
      return { ok: false, error: "Invalid time options." };
    }

    const { error: slotError } = await supabase
      .from("play_time_options")
      .insert(rows);

    if (slotError) {
      return { ok: false, error: slotError.message };
    }
  }

  const admin = createAdminClient();
  const { data: proposerProfile } = await admin
    .from("gamer_profiles")
    .select("display_name")
    .eq("account_id", ctx.account.id)
    .maybeSingle();

  await createPlayInvitationNotification({
    recipientAccountId: data.recipientAccountId,
    proposerDisplayName:
      (proposerProfile?.display_name as string) ?? "A connection",
    invitationId: invitation.id as string,
  });

  trackEvent("play_invitation_sent");
  revalidatePath("/play");
  revalidatePath(`/messages/${data.conversationId}`);
  return { ok: true };
}

export async function acceptPlayInvitation(
  invitationId: string,
  timeOptionId?: string | null,
): Promise<ActionResult> {
  const ctx = await requirePlayAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = acceptPlayInvitationSchema.safeParse({
    invitationId,
    timeOptionId: timeOptionId ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const supabase = await createClient();
  const { data: sessionId, error } = await supabase.rpc("accept_play_invitation", {
    p_invitation_id: parsed.data.invitationId,
    p_time_option_id: parsed.data.timeOptionId ?? null,
  });

  if (error) {
    const message = error.message.includes("blocked")
      ? "This invitation is no longer available."
      : error.message.includes("expired")
        ? "This invitation has expired."
        : error.message.includes("time option")
          ? "Select a time to accept."
          : "Could not accept invitation.";
    return { ok: false, error: message };
  }

  trackEvent("play_invitation_accepted");
  revalidatePath("/play");
  revalidatePath(`/play/invitations/${invitationId}`);
  return { ok: true, sessionId: sessionId as string };
}

export async function declinePlayInvitation(
  invitationId: string,
): Promise<ActionResult> {
  const ctx = await requirePlayAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("play_invitations")
    .update({
      status: "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", invitationId)
    .eq("recipient_account_id", ctx.account.id)
    .eq("status", "proposed");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/play");
  revalidatePath(`/play/invitations/${invitationId}`);
  return { ok: true };
}

export async function cancelPlayInvitation(
  invitationId: string,
): Promise<ActionResult> {
  const ctx = await requirePlayAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("play_invitations")
    .update({ status: "cancelled" })
    .eq("id", invitationId)
    .eq("proposer_account_id", ctx.account.id)
    .eq("status", "proposed");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/play");
  revalidatePath(`/play/invitations/${invitationId}`);
  return { ok: true };
}

export async function confirmSessionOccurred(
  sessionId: string,
): Promise<ActionResult> {
  const ctx = await requirePlayAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { data: session } = await supabase
    .from("gaming_sessions")
    .select("participant_a_id, participant_b_id, occurred_a, occurred_b, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) return { ok: false, error: "Session not found." };

  const isA = session.participant_a_id === ctx.account.id;
  const isB = session.participant_b_id === ctx.account.id;
  if (!isA && !isB) return { ok: false, error: "Session not found." };

  const update: Record<string, unknown> = {};
  if (isA) update.occurred_a = true;
  if (isB) update.occurred_b = true;

  const nextA = isA ? true : (session.occurred_a as boolean | null);
  const nextB = isB ? true : (session.occurred_b as boolean | null);

  if (bothParticipantsConfirmedOccurred(nextA, nextB)) {
    update.status = "completed";
    update.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("gaming_sessions")
    .update(update)
    .eq("id", sessionId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/play");
  revalidatePath(`/play/sessions/${sessionId}`);
  return { ok: true };
}

export async function cancelGamingSession(
  sessionId: string,
): Promise<ActionResult> {
  const ctx = await requirePlayAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("gaming_sessions")
    .update({ status: "cancelled" })
    .eq("id", sessionId)
    .in("status", ["confirmed", "in_progress"]);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/play");
  revalidatePath(`/play/sessions/${sessionId}`);
  return { ok: true };
}

export async function submitPostPlayFeedback(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requirePlayAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = postPlayFeedbackSchema.safeParse({
    sessionId: formData.get("sessionId"),
    continuation: formData.get("continuation"),
  });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("post_play_feedback").upsert(
    {
      session_id: parsed.data.sessionId,
      account_id: ctx.account.id,
      continuation: parsed.data.continuation,
    },
    { onConflict: "session_id,account_id" },
  );

  if (error) return { ok: false, error: error.message };

  if (parsed.data.continuation === "add_teammate") {
    const teammatesEnabled = await isFeatureEnabled("teammates_enabled");
    if (teammatesEnabled) {
      await recordIntent(parsed.data.sessionId, ctx.account.id);
    }
  }

  revalidatePath(`/play/sessions/${parsed.data.sessionId}`);
  return { ok: true };
}
