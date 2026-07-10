import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import { createFixtureAdmin, createAnonAuthClient } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T003][integration] @p0 registration", () => {
  let user: ProvisionedUser | null = null;

  beforeEach(async () => {
    await setFeatureFlag("registration_open", true);
  });

  afterEach(async () => {
    if (user) {
      await deleteAuthUser(user.authUserId);
      user = null;
    }
    await setFeatureFlag("registration_open", false);
  });

  it("provisions an onboarding account when a user signs up", async () => {
    assertTestGuards();
    const anon = createAnonAuthClient();
    const email = `register-${crypto.randomUUID().slice(0, 8)}@test.local`;
    const password = "TestPass123!";

    const { data, error } = await anon.auth.signUp({
      email,
      password,
    });
    expect(error).toBeNull();
    expect(data.user?.id).toBeTruthy();

    const authUserId = data.user!.id;
    user = {
      authUserId,
      email,
      password,
      accountId: "",
    };

    const admin = createFixtureAdmin();
    const { data: account, error: accountError } = await admin
      .from("accounts")
      .select("id, status, email")
      .eq("auth_user_id", authUserId)
      .single();

    expect(accountError).toBeNull();
    expect(account?.status).toBe("onboarding");
    expect(account?.email).toBe(email);
    user.accountId = account!.id as string;

    const { data: profile } = await admin
      .from("gamer_profiles")
      .select("onboarding_step")
      .eq("account_id", user.accountId)
      .single();
    expect(profile?.onboarding_step).toBe("identity");
  });

  it("characterizes Q01-open local sign-up session behavior", async () => {
    // Q01: email confirmation policy is open; local sign-up may return a session immediately.
    assertTestGuards();
    user = await provisionAuthUser("q01-registration");
    expect(user.accountId).toBeTruthy();
    const admin = createFixtureAdmin();
    const { data: account } = await admin
      .from("accounts")
      .select("status")
      .eq("id", user.accountId)
      .single();
    expect(account?.status).toBe("onboarding");
  });
});
