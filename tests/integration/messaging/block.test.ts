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

describe("[SL-T053][integration] @p0 messaging block", () => {
  let blocker: ProvisionedUser | null = null;
  let blocked: ProvisionedUser | null = null;

  afterEach(async () => {
    if (blocker) await deleteAuthUser(blocker.authUserId);
    if (blocked) await deleteAuthUser(blocked.authUserId);
    blocker = null;
    blocked = null;
    await setFeatureFlag("messaging_enabled", false);
  });

  it("prevents blocked users from sending new messages", async () => {
    assertTestGuards();
    await setFeatureFlag("messaging_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    blocker = await provisionAuthUser("msg-block-a", { status: "active" });
    blocked = await provisionAuthUser("msg-block-b", { status: "active" });
    await completeActiveProfile(blocker, "Blocker");
    await completeActiveProfile(blocked, "Blocked");
    const { conversationId } = await connectUsers(blocker, blocked);

    const blockerSession = await signInProvisionedUser(blocker);
    const blockerActor = await createActorClient(blockerSession);
    const { error: blockError } = await blockerActor.from("blocks").insert({
      blocker_account_id: blocker.accountId,
      blocked_account_id: blocked.accountId,
    });
    expect(blockError).toBeNull();

    const blockedSession = await signInProvisionedUser(blocked);
    const blockedActor = await createActorClient(blockedSession);
    const retentionAt = new Date();
    retentionAt.setMonth(retentionAt.getMonth() + 12);
    const { error: sendError } = await blockedActor.from("messages").insert({
      conversation_id: conversationId,
      sender_account_id: blocked.accountId,
      body: "Should not send",
      retention_at: retentionAt.toISOString(),
    });
    expect(sendError).toBeTruthy();
  });
});
