import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  completeActiveProfile,
  sendConnectionRequestAs,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T039][integration] @p0 connection send", () => {
  let sender: ProvisionedUser | null = null;
  let recipient: ProvisionedUser | null = null;

  afterEach(async () => {
    if (sender) await deleteAuthUser(sender.authUserId);
    if (recipient) await deleteAuthUser(recipient.authUserId);
    sender = null;
    recipient = null;
    await setFeatureFlag("connection_requests_enabled", false);
  });

  it("creates a pending outgoing request visible to sender and recipient", async () => {
    assertTestGuards();
    await setFeatureFlag("connection_requests_enabled", true);
    sender = await provisionAuthUser("conn-send", { status: "active" });
    recipient = await provisionAuthUser("conn-recv", { status: "active" });
    await completeActiveProfile(sender, "ConnSender");
    await completeActiveProfile(recipient, "ConnRecipient");

    const requestId = await sendConnectionRequestAs(
      sender,
      recipient.accountId,
      "Fortnite duo?",
    );

    const senderSession = await signInProvisionedUser(sender);
    const recipientSession = await signInProvisionedUser(recipient);
    const senderActor = await createActorClient(senderSession);
    const recipientActor = await createActorClient(recipientSession);

    const { data: outgoing } = await senderActor
      .from("connection_requests")
      .select("id, status, message")
      .eq("id", requestId)
      .single();
    expect(outgoing?.status).toBe("pending");
    expect(outgoing?.message).toBe("Fortnite duo?");

    const { data: incoming } = await recipientActor
      .from("connection_requests")
      .select("id, status")
      .eq("id", requestId)
      .single();
    expect(incoming?.status).toBe("pending");
  });

  it("rejects duplicate pending requests between the same pair", async () => {
    assertTestGuards();
    await setFeatureFlag("connection_requests_enabled", true);
    sender = await provisionAuthUser("conn-dup-a", { status: "active" });
    recipient = await provisionAuthUser("conn-dup-b", { status: "active" });
    await completeActiveProfile(sender, "DupSender");
    await completeActiveProfile(recipient, "DupRecipient");

    await sendConnectionRequestAs(sender, recipient.accountId);

    const session = await signInProvisionedUser(sender);
    const actor = await createActorClient(session);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    const { error } = await actor.from("connection_requests").insert({
      sender_account_id: sender.accountId,
      recipient_account_id: recipient.accountId,
      message: "Duplicate",
      status: "pending",
      expires_at: expiresAt.toISOString(),
    });
    expect(error?.code).toBe("23505");
  });
});
