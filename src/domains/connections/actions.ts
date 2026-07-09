"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { requireWritableAccount } from "@/domains/billing/entitlements";
import { CONNECTION_REQUEST_TTL_DAYS } from "@/domains/connections/constants";
import {
  connectionRequestLimitError,
  orderedPair,
} from "@/domains/connections/helpers";
import {
  getRequestLimitCounts,
  hasBlockBetween,
} from "@/domains/connections/queries";
import { sendConnectionRequestSchema } from "@/domains/connections/schemas";
import { canViewProfile } from "@/domains/discovery/queries";
import { getCurrentIntent } from "@/domains/profile/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics/events";
import type { Account } from "@/domains/accounts/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

type ConnectionAccountContext =
  { ok: false; error: string } | { ok: true; account: Account };

async function requireConnectionAccount(): Promise<ConnectionAccountContext> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };
  if (account.status !== "active") {
    return { ok: false, error: "Complete attestation before continuing." };
  }
  const writable = await requireWritableAccount(account.id);
  if (!writable.ok) return { ok: false, error: writable.error };
  const enabled = await isFeatureEnabled("connection_requests_enabled");
  if (!enabled) {
    return { ok: false, error: "Connection requests are not enabled yet." };
  }
  return { ok: true, account };
}

function firstZodError(parsed: {
  success: false;
  error: { issues: { message?: string }[] };
}): string {
  return parsed.error.issues[0]?.message ?? "Invalid form";
}

export async function sendConnectionRequest(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireConnectionAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = sendConnectionRequestSchema.safeParse({
    recipientAccountId: formData.get("recipientAccountId"),
    message: formData.get("message")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const { recipientAccountId, message } = parsed.data;
  if (recipientAccountId === ctx.account.id) {
    return { ok: false, error: "You cannot send a request to yourself." };
  }

  const canView = await canViewProfile(ctx.account.id, recipientAccountId);
  if (!canView) {
    return { ok: false, error: "This profile is not available." };
  }

  if (await hasBlockBetween(ctx.account.id, recipientAccountId)) {
    return { ok: false, error: "This request cannot be sent." };
  }

  const limits = await getRequestLimitCounts(ctx.account.id);
  const limitError = connectionRequestLimitError(limits);
  if (limitError) {
    return { ok: false, error: limitError };
  }

  const supabase = await createClient();

  const pair = orderedPair(ctx.account.id, recipientAccountId);
  const { data: existingConnection } = await supabase
    .from("connections")
    .select("id")
    .eq("user_a_id", pair.userA)
    .eq("user_b_id", pair.userB)
    .eq("status", "connected")
    .maybeSingle();

  if (existingConnection) {
    return { ok: false, error: "You are already connected." };
  }

  const intent = await getCurrentIntent(ctx.account.id);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CONNECTION_REQUEST_TTL_DAYS);

  const { error } = await supabase.from("connection_requests").insert({
    sender_account_id: ctx.account.id,
    recipient_account_id: recipientAccountId,
    intent_id: intent?.id ?? null,
    message: message && message.length > 0 ? message : null,
    status: "pending",
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "A pending request already exists." };
    }
    return { ok: false, error: error.message };
  }

  trackEvent("connection_request_sent");
  revalidatePath("/connections");
  revalidatePath(`/profile/${recipientAccountId}`);
  return { ok: true };
}

export async function acceptConnectionRequest(
  requestId: string,
): Promise<ActionResult> {
  const ctx = await requireConnectionAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_connection_request", {
    p_request_id: requestId,
  });

  if (error) {
    const message = error.message.includes("blocked")
      ? "This request is no longer available."
      : error.message.includes("expired")
        ? "This request has expired."
        : error.message.includes("forbidden")
          ? "You cannot accept this request."
          : "Could not accept request. Try again.";
    return { ok: false, error: message };
  }

  if (!data) {
    return { ok: false, error: "Could not accept request." };
  }

  trackEvent("connection_request_accepted");
  revalidatePath("/connections");
  return { ok: true };
}

export async function declineConnectionRequest(
  requestId: string,
): Promise<ActionResult> {
  const ctx = await requireConnectionAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { data: request } = await supabase
    .from("connection_requests")
    .select("recipient_account_id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (!request || request.recipient_account_id !== ctx.account.id) {
    return { ok: false, error: "Request not found." };
  }
  if (request.status !== "pending") {
    return { ok: false, error: "Request is no longer pending." };
  }

  const { error } = await supabase
    .from("connection_requests")
    .update({
      status: "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("recipient_account_id", ctx.account.id)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/connections");
  return { ok: true };
}

export async function cancelConnectionRequest(
  requestId: string,
): Promise<ActionResult> {
  const ctx = await requireConnectionAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("connection_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("sender_account_id", ctx.account.id)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/connections");
  return { ok: true };
}

export async function blockAccount(
  targetAccountId: string,
): Promise<ActionResult> {
  const ctx = await requireConnectionAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  if (targetAccountId === ctx.account.id) {
    return { ok: false, error: "You cannot block yourself." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("blocks").insert({
    blocker_account_id: ctx.account.id,
    blocked_account_id: targetAccountId,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }

  trackEvent("block_created");
  revalidatePath("/connections");
  revalidatePath("/discover");
  revalidatePath(`/profile/${targetAccountId}`);
  return { ok: true };
}

export async function unblockAccount(
  targetAccountId: string,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_account_id", account.id)
    .eq("blocked_account_id", targetAccountId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/connections");
  revalidatePath(`/profile/${targetAccountId}`);
  return { ok: true };
}
