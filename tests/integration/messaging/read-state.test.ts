import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  completeActiveProfile,
  connectUsers,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T052][integration] @p1 messaging read state", () => {
  let sender: ProvisionedUser | null = null;
  let recipient: ProvisionedUser | null = null;

  afterEach(async () => {
    if (sender) await deleteAuthUser(sender.authUserId);
    if (recipient) await deleteAuthUser(recipient.authUserId);
    sender = null;
    recipient = null;
    await setFeatureFlag("messaging_enabled", false);
    await setFeatureFlag("connection_requests_enabled", false);
  });

  it("updates last_read_at when a recipient opens a conversation", async () => {
    assertTestGuards();
    await setFeatureFlag("messaging_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    sender = await provisionAuthUser("read-a", { status: "active" });
    recipient = await provisionAuthUser("read-b", { status: "active" });
    await completeActiveProfile(sender, "ReadSender");
    await completeActiveProfile(recipient, "ReadRecipient");
    const { conversationId } = await connectUsers(sender, recipient);

    const senderSession = await signInProvisionedUser(sender);
    const senderActor = await createActorClient(senderSession);
    const retentionAt = new Date();
    retentionAt.setMonth(retentionAt.getMonth() + 12);
    await senderActor.from("messages").insert({
      conversation_id: conversationId,
      sender_account_id: sender.accountId,
      body: "Unread ping",
      retention_at: retentionAt.toISOString(),
    });

    const recipientSession = await signInProvisionedUser(recipient);
    const recipientActor = await createActorClient(recipientSession);
    const readAt = new Date().toISOString();
    const { error } = await recipientActor
      .from("conversation_members")
      .update({ last_read_at: readAt })
      .eq("conversation_id", conversationId)
      .eq("account_id", recipient.accountId);
    expect(error).toBeNull();

    const { data: membership } = await recipientActor
      .from("conversation_members")
      .select("last_read_at")
      .eq("conversation_id", conversationId)
      .eq("account_id", recipient.accountId)
      .single();
    expect(membership?.last_read_at).toBeTruthy();
  });
});
