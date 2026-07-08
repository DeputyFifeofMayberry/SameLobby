import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewMessageEmail } from "@/lib/email/client";

type NewMessageNotificationInput = {
  recipientAccountId: string;
  senderDisplayName: string;
  conversationId: string;
};

export async function createNewMessageNotification(
  input: NewMessageNotificationInput,
): Promise<void> {
  const admin = createAdminClient();

  const { data: recipient } = await admin
    .from("accounts")
    .select("id, email")
    .eq("id", input.recipientAccountId)
    .maybeSingle();

  if (!recipient) return;

  const href = `/messages/${input.conversationId}`;
  const title = "New message";
  const body = `You have a new message from ${input.senderDisplayName}.`;

  await admin.from("notifications").insert({
    account_id: input.recipientAccountId,
    kind: "new_message",
    title,
    body,
    href,
  });

  const { data: prefs } = await admin
    .from("notification_preferences")
    .select("email_new_message")
    .eq("account_id", input.recipientAccountId)
    .maybeSingle();

  const emailEnabled = prefs?.email_new_message !== false;

  if (emailEnabled && recipient.email) {
    await sendNewMessageEmail({
      to: recipient.email as string,
      conversationUrl: href,
    });
  }
}
