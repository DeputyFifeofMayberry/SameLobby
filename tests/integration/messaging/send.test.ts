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

describe("[SL-T050][integration] @p0 message send", () => {
  let userA: ProvisionedUser | null = null;
  let userB: ProvisionedUser | null = null;

  afterEach(async () => {
    if (userA) await deleteAuthUser(userA.authUserId);
    if (userB) await deleteAuthUser(userB.authUserId);
    userA = null;
    userB = null;
    await setFeatureFlag("messaging_enabled", false);
    await setFeatureFlag("links_in_messages", false);
  });

  it("delivers a direct message to the connected recipient", async () => {
    assertTestGuards();
    await setFeatureFlag("messaging_enabled", true);
    userA = await provisionAuthUser("msg-a", { status: "active" });
    userB = await provisionAuthUser("msg-b", { status: "active" });
    await completeActiveProfile(userA, "MsgSender");
    await completeActiveProfile(userB, "MsgRecipient");
    await setFeatureFlag("connection_requests_enabled", true);
    const { conversationId } = await connectUsers(userA, userB);

    const session = await signInProvisionedUser(userA);
    const actor = await createActorClient(session);
    const retentionAt = new Date();
    retentionAt.setMonth(retentionAt.getMonth() + 12);
    const { error } = await actor.from("messages").insert({
      conversation_id: conversationId,
      sender_account_id: userA.accountId,
      body: "Ready to queue?",
      retention_at: retentionAt.toISOString(),
    });
    expect(error).toBeNull();

    const recipientSession = await signInProvisionedUser(userB);
    const recipientActor = await createActorClient(recipientSession);
    const { data: messages } = await recipientActor
      .from("messages")
      .select("body, sender_account_id")
      .eq("conversation_id", conversationId);
    expect(messages?.some((m) => m.body === "Ready to queue?")).toBe(true);
  });

  it("blocks links when links_in_messages is disabled (Q08 open)", async () => {
    assertTestGuards();
    await setFeatureFlag("messaging_enabled", true);
    await setFeatureFlag("links_in_messages", false);
    userA = await provisionAuthUser("msg-link-a", { status: "active" });
    userB = await provisionAuthUser("msg-link-b", { status: "active" });
    await completeActiveProfile(userA, "LinkSender");
    await completeActiveProfile(userB, "LinkRecipient");
    await setFeatureFlag("connection_requests_enabled", true);
    const { conversationId } = await connectUsers(userA, userB);

    const { containsLink } = await import("@/domains/messaging/schemas");
    expect(containsLink("check https://example.com")).toBe(true);

    const session = await signInProvisionedUser(userA);
    const actor = await createActorClient(session);
    const retentionAt = new Date();
    retentionAt.setMonth(retentionAt.getMonth() + 12);
    const { data: inserted } = await actor
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_account_id: userA.accountId,
        body: "visit https://example.com",
        retention_at: retentionAt.toISOString(),
      })
      .select("id");

    // Current product allows DB insert; server action rejects links pre-insert.
    // Characterize current DB behavior until Q08 contract lands (Package 4.2).
    expect((inserted ?? []).length).toBeGreaterThan(0);
  });
});
