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

describe("[SL-T055][realtime-integ] @p0 conversation realtime", () => {
  let userA: ProvisionedUser | null = null;
  let userB: ProvisionedUser | null = null;

  afterEach(async () => {
    if (userA) await deleteAuthUser(userA.authUserId);
    if (userB) await deleteAuthUser(userB.authUserId);
    userA = null;
    userB = null;
    await setFeatureFlag("messaging_enabled", false);
  });

  it("delivers new messages to connected conversation members", async () => {
    assertTestGuards();
    await setFeatureFlag("messaging_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    userA = await provisionAuthUser("rt-a", { status: "active" });
    userB = await provisionAuthUser("rt-b", { status: "active" });
    await completeActiveProfile(userA, "RtA");
    await completeActiveProfile(userB, "RtB");
    const { conversationId } = await connectUsers(userA, userB);

    const senderSession = await signInProvisionedUser(userA);
    const sender = await createActorClient(senderSession);
    const retentionAt = new Date();
    retentionAt.setMonth(retentionAt.getMonth() + 12);
    const { error } = await sender.from("messages").insert({
      conversation_id: conversationId,
      sender_account_id: userA.accountId,
      body: "Realtime hello",
      retention_at: retentionAt.toISOString(),
    });
    expect(error).toBeNull();

    const recipientSession = await signInProvisionedUser(userB);
    const recipient = await createActorClient(recipientSession);
    const { data: messages } = await recipient
      .from("messages")
      .select("body")
      .eq("conversation_id", conversationId);
    expect(messages?.some((m) => m.body === "Realtime hello")).toBe(true);
  });
});
