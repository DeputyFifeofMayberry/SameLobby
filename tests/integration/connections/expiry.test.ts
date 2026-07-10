import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  completeActiveProfile,
  sendConnectionRequestAs,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient, createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T048][integration] @p2 connection request expiry", () => {
  let sender: ProvisionedUser | null = null;
  let recipient: ProvisionedUser | null = null;

  afterEach(async () => {
    if (sender) await deleteAuthUser(sender.authUserId);
    if (recipient) await deleteAuthUser(recipient.authUserId);
    sender = null;
    recipient = null;
    await setFeatureFlag("connection_requests_enabled", false);
  });

  it("marks expired pending requests and rejects accept RPC", async () => {
    assertTestGuards();
    await setFeatureFlag("connection_requests_enabled", true);
    sender = await provisionAuthUser("conn-exp-a", { status: "active" });
    recipient = await provisionAuthUser("conn-exp-b", { status: "active" });
    await completeActiveProfile(sender, "ExpSender");
    await completeActiveProfile(recipient, "ExpRecipient");

    const requestId = await sendConnectionRequestAs(sender, recipient.accountId);

    const senderSession = await signInProvisionedUser(sender);
    const senderActor = await createActorClient(senderSession);
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const { error: expireError } = await senderActor
      .from("connection_requests")
      .update({ expires_at: past.toISOString() })
      .eq("id", requestId);
    expect(expireError).toBeNull();

    const session = await signInProvisionedUser(recipient);
    const actor = await createActorClient(session);
    const { data: acceptData, error: acceptError } = await actor.rpc(
      "accept_connection_request",
      {
        p_request_id: requestId,
      },
    );
    expect(acceptError).toBeNull();
    expect(acceptData).toBeNull();

    const admin = createFixtureAdmin();

    const { data: request } = await admin
      .from("connection_requests")
      .select("status")
      .eq("id", requestId)
      .single();
    expect(request?.status).toBe("expired");
  });
});
