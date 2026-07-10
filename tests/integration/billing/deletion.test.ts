import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { completeActiveProfile } from "../../support/integration-fixtures";
import {
  createFixtureAdmin,
  signInWithPasswordThroughApi,
  createActorClient,
} from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T107][integration] @p0 billing deletion", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) await deleteAuthUser(user.authUserId);
    user = null;
  });

  it("confirms deletion request after password re-auth when no Stripe subscription", async () => {
    assertTestGuards();
    user = await provisionAuthUser("bill-del", {
      status: "active",
      password: "TestPass123!",
    });
    await completeActiveProfile(user, "BillDelete");

    const admin = createFixtureAdmin();
    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + 30);
    await admin.rpc("request_account_deletion", {
      p_account_id: user.accountId,
      p_scheduled_purge_at: scheduled.toISOString(),
    });

    const session = await signInWithPasswordThroughApi(
      user.email,
      user.password,
    );
    const actor = await createActorClient(session);
    const { error: confirmError } = await actor.rpc("confirm_account_deletion", {
      p_account_id: user.accountId,
    });
    expect(confirmError).toBeNull();

    const { data: request } = await admin
      .from("deletion_requests")
      .select("status")
      .eq("account_id", user.accountId)
      .single();
    expect(request?.status).toBe("confirmed");
  });
});
