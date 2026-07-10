import { vi } from "vitest";

vi.mock("server-only", () => ({}));

import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
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
import { createNewMessageNotification } from "@/domains/notifications/service";

describe("[SL-T058][integration] @p1 notification service", () => {
  let sender: ProvisionedUser | null = null;
  let recipient: ProvisionedUser | null = null;

  afterEach(async () => {
    if (sender) await deleteAuthUser(sender.authUserId);
    if (recipient) await deleteAuthUser(recipient.authUserId);
    sender = null;
    recipient = null;
  });

  it("inserts an in-app new_message notification for the recipient", async () => {
    assertTestGuards();
    sender = await provisionAuthUser("notif-a", { status: "active" });
    recipient = await provisionAuthUser("notif-b", { status: "active" });
    await completeActiveProfile(sender, "NotifSender");
    await completeActiveProfile(recipient, "NotifRecipient");
    const { conversationId } = await connectUsers(sender, recipient);

    await createNewMessageNotification({
      recipientAccountId: recipient.accountId,
      senderDisplayName: "NotifSender",
      conversationId,
    });

    const admin = createFixtureAdmin();
    const { data: notifications } = await admin
      .from("notifications")
      .select("kind, title, href")
      .eq("account_id", recipient.accountId)
      .eq("kind", "new_message");
    expect((notifications ?? []).length).toBeGreaterThanOrEqual(1);
    expect(notifications?.[0]?.href).toBe(`/messages/${conversationId}`);
    expect(notifications?.[0]?.title).toBe("New message");
  });
});
