"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { blockAccount } from "@/domains/connections/actions";
import { canSendMessages, permissionAfterBlock } from "@/domains/messaging/permissions";
import {
  countRecentMessages,
  getConversationThread,
  markConversationRead,
} from "@/domains/messaging/queries";
import { messageRateLimitError } from "@/domains/messaging/rate-limits";
import {
  containsLink,
  reportSchema,
  sendMessageSchema,
} from "@/domains/messaging/schemas";
import { createNewMessageNotification } from "@/domains/notifications/service";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { trackEvent } from "@/lib/analytics/events";
import type { Account } from "@/domains/accounts/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

type MessagingAccountContext =
  | { ok: false; error: string }
  | { ok: true; account: Account };

async function requireMessagingAccount(): Promise<MessagingAccountContext> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };
  if (account.status !== "active") {
    return { ok: false, error: "Complete attestation before messaging." };
  }
  const enabled = await isFeatureEnabled("messaging_enabled");
  if (!enabled) {
    return { ok: false, error: "Messaging is not enabled yet." };
  }
  return { ok: true, account };
}

function firstZodError(parsed: {
  success: false;
  error: { issues: { message?: string }[] };
}): string {
  return parsed.error.issues[0]?.message ?? "Invalid form";
}

export async function sendMessage(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireMessagingAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const linksEnabled = await isFeatureEnabled("links_in_messages");
  const allowLinks = formData.get("allowLinks") === "true";

  const parsed = sendMessageSchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
    allowLinks: linksEnabled || allowLinks,
  });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const { conversationId, body } = parsed.data;

  if (!linksEnabled && !allowLinks && containsLink(body)) {
    return {
      ok: false,
      error: "Links are not allowed in messages yet. Remove the link or confirm to send.",
    };
  }

  const thread = await getConversationThread(ctx.account.id, conversationId);
  if (!thread) {
    return { ok: false, error: "Conversation not found." };
  }
  if (!canSendMessages(thread.conversation.permission)) {
    return { ok: false, error: "You cannot send messages in this conversation." };
  }

  const rateError = messageRateLimitError({
    messagesSentInWindow: await countRecentMessages(ctx.account.id),
  });
  if (rateError) return { ok: false, error: rateError };

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_account_id: ctx.account.id,
    body,
  });

  if (error) return { ok: false, error: error.message };

  trackEvent("message_sent");

  const admin = createAdminClient();
  const { data: senderProfile } = await admin
    .from("gamer_profiles")
    .select("display_name")
    .eq("account_id", ctx.account.id)
    .maybeSingle();

  await createNewMessageNotification({
    recipientAccountId: thread.otherAccountId,
    senderDisplayName: (senderProfile?.display_name as string) ?? "A connection",
    conversationId,
  });

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { ok: true };
}

export async function openConversation(
  conversationId: string,
): Promise<ActionResult> {
  const ctx = await requireMessagingAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const thread = await getConversationThread(ctx.account.id, conversationId);
  if (!thread) return { ok: false, error: "Conversation not found." };

  await markConversationRead(ctx.account.id, conversationId);

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("account_id", ctx.account.id)
    .eq("href", `/messages/${conversationId}`)
    .is("read_at", null);

  return { ok: true };
}

export async function blockInConversation(
  conversationId: string,
  targetAccountId: string,
): Promise<ActionResult> {
  const blockResult = await blockAccount(targetAccountId);
  if (!blockResult.ok) return blockResult;

  const admin = createAdminClient();
  await admin
    .from("conversations")
    .update({ permission: permissionAfterBlock() })
    .eq("id", conversationId);

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { ok: true };
}

export async function submitReport(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireMessagingAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = reportSchema.safeParse({
    reportedAccountId: formData.get("reportedAccountId"),
    conversationId: formData.get("conversationId") || undefined,
    category: formData.get("category"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_account_id: ctx.account.id,
    reported_account_id: parsed.data.reportedAccountId,
    conversation_id: parsed.data.conversationId ?? null,
    category: parsed.data.category,
    description: parsed.data.description,
  });

  if (error) return { ok: false, error: error.message };

  trackEvent("report_submitted");
  return { ok: true };
}
