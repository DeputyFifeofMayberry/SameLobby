import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  acceptConnectionRequestAs,
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

describe("[SL-T041][integration] @p1 connection transitions", () => {
  let sender: ProvisionedUser | null = null;
  let recipient: ProvisionedUser | null = null;

  afterEach(async () => {
    if (sender) await deleteAuthUser(sender.authUserId);
    if (recipient) await deleteAuthUser(recipient.authUserId);
    sender = null;
    recipient = null;
    await setFeatureFlag("connection_requests_enabled", false);
  });

  it("accepts a pending request into a connected relationship", async () => {
    assertTestGuards();
    await setFeatureFlag("connection_requests_enabled", true);
    sender = await provisionAuthUser("conn-trans-a", { status: "active" });
    recipient = await provisionAuthUser("conn-trans-b", { status: "active" });
    await completeActiveProfile(sender, "TransSender");
    await completeActiveProfile(recipient, "TransRecipient");

    const requestId = await sendConnectionRequestAs(sender, recipient.accountId);
    const connectionId = await acceptConnectionRequestAs(recipient, requestId);

    const recipientSession = await signInProvisionedUser(recipient);
    const actor = await createActorClient(recipientSession);
    const { data: request } = await actor
      .from("connection_requests")
      .select("status")
      .eq("id", requestId)
      .single();
    const { data: connection } = await actor
      .from("connections")
      .select("status")
      .eq("id", connectionId)
      .single();

    expect(request?.status).toBe("accepted");
    expect(connection?.status).toBe("connected");
  });

  it("declines a pending incoming request", async () => {
    assertTestGuards();
    await setFeatureFlag("connection_requests_enabled", true);
    sender = await provisionAuthUser("conn-decline-a", { status: "active" });
    recipient = await provisionAuthUser("conn-decline-b", { status: "active" });
    await completeActiveProfile(sender, "DeclineSender");
    await completeActiveProfile(recipient, "DeclineRecipient");

    const requestId = await sendConnectionRequestAs(sender, recipient.accountId);
    const session = await signInProvisionedUser(recipient);
    const actor = await createActorClient(session);
    const { error } = await actor
      .from("connection_requests")
      .update({
        status: "declined",
        responded_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("recipient_account_id", recipient.accountId)
      .eq("status", "pending");
    expect(error).toBeNull();

    const { data: request } = await actor
      .from("connection_requests")
      .select("status")
      .eq("id", requestId)
      .single();
    expect(request?.status).toBe("declined");
  });

  it("cancels a pending outgoing request", async () => {
    assertTestGuards();
    await setFeatureFlag("connection_requests_enabled", true);
    sender = await provisionAuthUser("conn-cancel-a", { status: "active" });
    recipient = await provisionAuthUser("conn-cancel-b", { status: "active" });
    await completeActiveProfile(sender, "CancelSender");
    await completeActiveProfile(recipient, "CancelRecipient");

    const requestId = await sendConnectionRequestAs(sender, recipient.accountId);
    const session = await signInProvisionedUser(sender);
    const actor = await createActorClient(session);
    const { error } = await actor
      .from("connection_requests")
      .update({ status: "cancelled" })
      .eq("id", requestId)
      .eq("sender_account_id", sender.accountId)
      .eq("status", "pending");
    expect(error).toBeNull();

    const { data: request } = await actor
      .from("connection_requests")
      .select("status")
      .eq("id", requestId)
      .single();
    expect(request?.status).toBe("cancelled");
  });
});
