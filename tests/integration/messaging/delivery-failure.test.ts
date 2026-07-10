import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/email/client", () => ({
  sendNewMessageEmail: vi
    .fn()
    .mockRejectedValue(new Error("resend unavailable")),
  sendPlayInvitationEmail: vi.fn(),
  sendPlayReminderEmail: vi.fn(),
}));

import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  completeActiveProfile,
  connectUsers,
} from "../../support/integration-fixtures";
import { createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T051][notification-db-failure] @p0 message delivery failure", () => {
  let sender: ProvisionedUser | null = null;
  let recipient: ProvisionedUser | null = null;

  afterEach(async () => {
    if (sender) await deleteAuthUser(sender.authUserId);
    if (recipient) await deleteAuthUser(recipient.authUserId);
    sender = null;
    recipient = null;
    await setFeatureFlag("messaging_enabled", false);
  });

  it("persists messages independently of notification rows (Q07 post-commit)", async () => {
    assertTestGuards();
    await setFeatureFlag("messaging_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    sender = await provisionAuthUser("deliv-sender", { status: "active" });
    recipient = await provisionAuthUser("deliv-recv", { status: "active" });
    await completeActiveProfile(sender, "DelivSender");
    await completeActiveProfile(recipient, "DelivRecipient");
    const { conversationId } = await connectUsers(sender, recipient);

    const { signInProvisionedUser } = await import("../../support/integration-fixtures");
    const { createActorClient } = await import("../../support/supabase");
    const session = await signInProvisionedUser(sender);
    const actor = await createActorClient(session);
    const retentionAt = new Date();
    retentionAt.setMonth(retentionAt.getMonth() + 12);
    const { data: message, error } = await actor
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_account_id: sender.accountId,
        body: "Post-commit message",
        retention_at: retentionAt.toISOString(),
      })
      .select("id")
      .single();
    expect(error).toBeNull();

    const admin = createFixtureAdmin();
    const { count } = await admin
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("account_id", recipient.accountId)
      .eq("kind", "new_message");
    expect(count).toBe(0);

    const { data: persisted } = await admin
      .from("messages")
      .select("id")
      .eq("id", message!.id as string)
      .maybeSingle();
    expect(persisted?.id).toBe(message!.id);
  });
});

describe("[SL-T051][email-postcommit-failure] @p0 message delivery failure", () => {
  let sender: ProvisionedUser | null = null;
  let recipient: ProvisionedUser | null = null;

  afterEach(async () => {
    if (sender) await deleteAuthUser(sender.authUserId);
    if (recipient) await deleteAuthUser(recipient.authUserId);
    sender = null;
    recipient = null;
  });

  it("persists in-app notification when email send fails (Q07 post-commit)", async () => {
    assertTestGuards();
    sender = await provisionAuthUser("email-fail-s", { status: "active" });
    recipient = await provisionAuthUser("email-fail-r", { status: "active" });
    await completeActiveProfile(sender, "EmailFailSender");
    await completeActiveProfile(recipient, "EmailFailRecipient");
    await setFeatureFlag("connection_requests_enabled", true);
    const { conversationId } = await connectUsers(sender, recipient);

    const { createNewMessageNotification } =
      await import("@/domains/notifications/service");
    await expect(
      createNewMessageNotification({
        recipientAccountId: recipient.accountId,
        senderDisplayName: "EmailFailSender",
        conversationId,
      }),
    ).rejects.toThrow("resend unavailable");

    const admin = createFixtureAdmin();
    const { data: notification } = await admin
      .from("notifications")
      .select("kind, href")
      .eq("account_id", recipient.accountId)
      .eq("kind", "new_message")
      .maybeSingle();
    expect(notification?.href).toBe(`/messages/${conversationId}`);
  });
});
