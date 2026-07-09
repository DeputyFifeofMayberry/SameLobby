import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewMessageEmail, sendPlayInvitationEmail, sendPlayReminderEmail } from "@/lib/email/client";

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

type PlayInvitationNotificationInput = {
  recipientAccountId: string;
  proposerDisplayName: string;
  invitationId: string;
};

export async function createPlayInvitationNotification(
  input: PlayInvitationNotificationInput,
): Promise<void> {
  const admin = createAdminClient();

  const { data: recipient } = await admin
    .from("accounts")
    .select("id, email")
    .eq("id", input.recipientAccountId)
    .maybeSingle();

  if (!recipient) return;

  const href = `/play/invitations/${input.invitationId}`;
  const title = "Play invitation";
  const body = `${input.proposerDisplayName} invited you to play.`;

  await admin.from("notifications").insert({
    account_id: input.recipientAccountId,
    kind: "play_invitation",
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
    await sendPlayInvitationEmail({
      to: recipient.email as string,
      invitationUrl: href,
    });
  }
}

type PlayReminderNotificationInput = {
  recipientAccountId: string;
  otherDisplayName: string;
  sessionId: string;
  windowLabel: string;
};

export async function createPlayReminderNotification(
  input: PlayReminderNotificationInput,
): Promise<void> {
  const admin = createAdminClient();

  const { data: recipient } = await admin
    .from("accounts")
    .select("id, email")
    .eq("id", input.recipientAccountId)
    .maybeSingle();

  if (!recipient) return;

  const href = `/play/sessions/${input.sessionId}`;
  const title = "Play session reminder";
  const body = `Your play session with ${input.otherDisplayName} starts in ${input.windowLabel}.`;

  await admin.from("notifications").insert({
    account_id: input.recipientAccountId,
    kind: "play_reminder",
    title,
    body,
    href,
  });

  const { data: prefs } = await admin
    .from("notification_preferences")
    .select("email_play_reminder")
    .eq("account_id", input.recipientAccountId)
    .maybeSingle();

  const emailEnabled = prefs?.email_play_reminder !== false;

  if (emailEnabled && recipient.email) {
    await sendPlayReminderEmail({
      to: recipient.email as string,
      sessionUrl: href,
      windowLabel: input.windowLabel,
    });
  }
}

type TeammateProposalNotificationInput = {
  recipientAccountId: string;
  proposerDisplayName: string;
};

export async function createTeammateProposalNotification(
  input: TeammateProposalNotificationInput,
): Promise<void> {
  const admin = createAdminClient();

  const { data: recipient } = await admin
    .from("accounts")
    .select("id, email")
    .eq("id", input.recipientAccountId)
    .maybeSingle();

  if (!recipient) return;

  const href = "/teammates";
  const title = "Teammate request";
  const body = `${input.proposerDisplayName} would like to be teammates.`;

  await admin.from("notifications").insert({
    account_id: input.recipientAccountId,
    kind: "teammate_proposal",
    title,
    body,
    href,
  });

  const { data: prefs } = await admin
    .from("notification_preferences")
    .select("email_new_message")
    .eq("account_id", input.recipientAccountId)
    .maybeSingle();

  if (prefs?.email_new_message !== false && recipient.email) {
    await sendNewMessageEmail({
      to: recipient.email as string,
      conversationUrl: href,
    });
  }
}

export async function createModerationOutcomeNotification(input: {
  recipientAccountId: string;
}): Promise<void> {
  const admin = createAdminClient();

  await admin.from("notifications").insert({
    account_id: input.recipientAccountId,
    kind: "moderation_outcome",
    title: "Account status updated",
    body: "Your account status was updated following a safety review.",
    href: "/settings/safety",
  });
}
