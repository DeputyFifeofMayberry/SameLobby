import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { createAnonAuthClient } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T008][integration] @p1 password reset", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) {
      await deleteAuthUser(user.authUserId);
      user = null;
    }
  });

  it("returns generic success for a provisioned user email (Q01)", async () => {
    assertTestGuards();
    user = await provisionAuthUser("pwd-reset-known", {
      status: "active",
      password: "TestPass123!",
    });

    const anon = createAnonAuthClient();
    const { error } = await anon.auth.resetPasswordForEmail(user.email, {
      redirectTo: "http://localhost:3000/auth/callback?type=recovery",
    });
    expect(error).toBeNull();
  });

  it("returns generic success for an unknown email without leaking account state (Q01)", async () => {
    assertTestGuards();
    const anon = createAnonAuthClient();
    const unknownEmail = `missing-${crypto.randomUUID().slice(0, 8)}@test.local`;

    const { error } = await anon.auth.resetPasswordForEmail(unknownEmail, {
      redirectTo: "http://localhost:3000/auth/callback?type=recovery",
    });
    expect(error).toBeNull();
  });
});
