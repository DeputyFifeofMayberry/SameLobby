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

describe("[SL-T056][integration] @p1 messaging reconnect", () => {
  let userA: ProvisionedUser | null = null;
  let userB: ProvisionedUser | null = null;

  afterEach(async () => {
    if (userA) await deleteAuthUser(userA.authUserId);
    if (userB) await deleteAuthUser(userB.authUserId);
    userA = null;
    userB = null;
    await setFeatureFlag("messaging_enabled", false);
    await setFeatureFlag("connection_requests_enabled", false);
  });

  it("reads messages after simulating a client reconnect with a fresh session", async () => {
    assertTestGuards();
    await setFeatureFlag("messaging_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    userA = await provisionAuthUser("reconnect-a", { status: "active" });
    userB = await provisionAuthUser("reconnect-b", { status: "active" });
    await completeActiveProfile(userA, "ReconnectA");
    await completeActiveProfile(userB, "ReconnectB");
    const { conversationId } = await connectUsers(userA, userB);

    const senderSession = await signInProvisionedUser(userA);
    const sender = await createActorClient(senderSession);
    const retentionAt = new Date();
    retentionAt.setMonth(retentionAt.getMonth() + 12);
    const { error: sendError } = await sender.from("messages").insert({
      conversation_id: conversationId,
      sender_account_id: userA.accountId,
      body: "Before reconnect",
      retention_at: retentionAt.toISOString(),
    });
    expect(sendError).toBeNull();

    const reconnectedSession = await signInProvisionedUser(userB);
    const reconnectedClient = await createActorClient(reconnectedSession);
    const { data: messages } = await reconnectedClient
      .from("messages")
      .select("body")
      .eq("conversation_id", conversationId);
    expect(messages?.some((m) => m.body === "Before reconnect")).toBe(true);
  });
});
