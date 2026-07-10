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

describe("[SL-T011][integration] @p0 attestation", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) {
      await deleteAuthUser(user.authUserId);
      user = null;
    }
  });

  it("completes attestation and activates the account", async () => {
    assertTestGuards();
    user = await provisionAuthUser("attestation");
    const admin = createFixtureAdmin();

    const { error: rpcError } = await admin.rpc("complete_account_attestation", {
      p_account_id: user.accountId,
      p_adult_attested_at: new Date().toISOString(),
      p_terms_version: "2026-07-08",
      p_privacy_version: "2026-07-08",
      p_community_standards_version: "2026-07-08",
      p_adult_attestation_version: "2026-07-08",
      p_ip_hash: "test-ip-hash",
      p_user_agent_hash: "test-ua-hash",
    });
    expect(rpcError).toBeNull();

    const session = await signInWithPasswordThroughApi(
      user.email,
      user.password,
    );
    const actor = await createActorClient(session);
    const { data: account } = await actor
      .from("accounts")
      .select("status, adult_attested_at, terms_version")
      .eq("id", user.accountId)
      .single();

    expect(account?.status).toBe("active");
    expect(account?.adult_attested_at).toBeTruthy();
    expect(account?.terms_version).toBe("2026-07-08");
  });
});
