import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import {
  createActorClient,
  createFixtureAdmin,
  signInWithPasswordThroughApi,
} from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T013][integration] @p0 deletion request", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) {
      await deleteAuthUser(user.authUserId);
      user = null;
    }
  });

  it("requests account deletion and moves account to deletion_pending", async () => {
    assertTestGuards();
    user = await provisionAuthUser("deletion", { status: "active" });
    const admin = createFixtureAdmin();
    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + 30);

    const { error: rpcError } = await admin.rpc("request_account_deletion", {
      p_account_id: user.accountId,
      p_scheduled_purge_at: scheduled.toISOString(),
    });
    expect(rpcError).toBeNull();

    const session = await signInWithPasswordThroughApi(
      user.email,
      user.password,
    );
    const actor = await createActorClient(session);
    const { data: account } = await actor
      .from("accounts")
      .select("status")
      .eq("id", user.accountId)
      .single();
    expect(account?.status).toBe("deletion_pending");

    const { data: request } = await admin
      .from("deletion_requests")
      .select("status")
      .eq("account_id", user.accountId)
      .maybeSingle();
    expect(request?.status).toBe("requested");
  });

  it("is idempotent when deletion is requested twice", async () => {
    assertTestGuards();
    user = await provisionAuthUser("deletion-idempotent", { status: "active" });
    const admin = createFixtureAdmin();
    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + 30);
    const scheduledIso = scheduled.toISOString();

    const { error: firstError } = await admin.rpc("request_account_deletion", {
      p_account_id: user.accountId,
      p_scheduled_purge_at: scheduledIso,
    });
    expect(firstError).toBeNull();

    const { error: secondError } = await admin.rpc("request_account_deletion", {
      p_account_id: user.accountId,
      p_scheduled_purge_at: scheduledIso,
    });
    expect(secondError).toBeNull();

    const { data: requests } = await admin
      .from("deletion_requests")
      .select("id, status")
      .eq("account_id", user.accountId);
    expect(requests).toHaveLength(1);
    expect(requests?.[0]?.status).toBe("requested");
  });
});
