import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  completeActiveProfile,
  connectUsers,
  sendConnectionRequestAs,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T043][integration] @p1 connection block", () => {
  let blocker: ProvisionedUser | null = null;
  let blocked: ProvisionedUser | null = null;

  afterEach(async () => {
    if (blocker) await deleteAuthUser(blocker.authUserId);
    if (blocked) await deleteAuthUser(blocked.authUserId);
    blocker = null;
    blocked = null;
    await setFeatureFlag("connection_requests_enabled", false);
  });

  it("prevents blocked users from sending new connection requests", async () => {
    assertTestGuards();
    await setFeatureFlag("connection_requests_enabled", true);
    blocker = await provisionAuthUser("conn-block-a", { status: "active" });
    blocked = await provisionAuthUser("conn-block-b", { status: "active" });
    await completeActiveProfile(blocker, "ConnBlocker");
    await completeActiveProfile(blocked, "ConnBlocked");

    const blockerSession = await signInProvisionedUser(blocker);
    const blockerActor = await createActorClient(blockerSession);
    const { error: blockError } = await blockerActor.from("blocks").insert({
      blocker_account_id: blocker.accountId,
      blocked_account_id: blocked.accountId,
    });
    expect(blockError).toBeNull();

    const blockedSession = await signInProvisionedUser(blocked);
    const blockedActor = await createActorClient(blockedSession);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    const { error: requestError } = await blockedActor
      .from("connection_requests")
      .insert({
        sender_account_id: blocked.accountId,
        recipient_account_id: blocker.accountId,
        message: "Should fail",
        status: "pending",
        expires_at: expiresAt.toISOString(),
      });
    expect(requestError).toBeTruthy();
  });

  it("prevents accepting requests when a block exists", async () => {
    assertTestGuards();
    await setFeatureFlag("connection_requests_enabled", true);
    blocker = await provisionAuthUser("conn-block-acc-a", { status: "active" });
    blocked = await provisionAuthUser("conn-block-acc-b", { status: "active" });
    await completeActiveProfile(blocker, "BlockAccBlocker");
    await completeActiveProfile(blocked, "BlockAccBlocked");

    const requestId = await sendConnectionRequestAs(blocked, blocker.accountId);
    const blockerSession = await signInProvisionedUser(blocker);
    const blockerActor = await createActorClient(blockerSession);
    await blockerActor.from("blocks").insert({
      blocker_account_id: blocker.accountId,
      blocked_account_id: blocked.accountId,
    });

    const { error } = await blockerActor.rpc("accept_connection_request", {
      p_request_id: requestId,
    });
    expect(error).toBeTruthy();
  });

  it("still allows connected users to remain connected until archived", async () => {
    assertTestGuards();
    await setFeatureFlag("connection_requests_enabled", true);
    blocker = await provisionAuthUser("conn-block-conn-a", { status: "active" });
    blocked = await provisionAuthUser("conn-block-conn-b", { status: "active" });
    await completeActiveProfile(blocker, "BlockConnA");
    await completeActiveProfile(blocked, "BlockConnB");
    const { connectionId } = await connectUsers(blocker, blocked);

    const session = await signInProvisionedUser(blocker);
    const actor = await createActorClient(session);
    const { data: connection } = await actor
      .from("connections")
      .select("status")
      .eq("id", connectionId)
      .single();
    expect(connection?.status).toBe("connected");
  });
});
