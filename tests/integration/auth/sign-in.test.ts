import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import {
  createActorClient,
  signInWithPasswordThroughApi,
} from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T006][integration] @p0 sign-in", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) {
      await deleteAuthUser(user.authUserId);
      user = null;
    }
  });

  it("signs in through the password API and reads own account via RLS", async () => {
    assertTestGuards();
    user = await provisionAuthUser("sign-in", {
      status: "active",
      password: "TestPass123!",
    });

    const session = await signInWithPasswordThroughApi(
      user.email,
      user.password,
    );
    expect(session.access_token).toBeTruthy();

    const actor = await createActorClient(session);
    const { data: account, error } = await actor
      .from("accounts")
      .select("id, status, email")
      .eq("auth_user_id", user.authUserId)
      .single();

    expect(error).toBeNull();
    expect(account?.id).toBe(user.accountId);
    expect(account?.status).toBe("active");
    expect(account?.email).toBe(user.email);
  });

  it("rejects invalid credentials without exposing account rows", async () => {
    assertTestGuards();
    user = await provisionAuthUser("sign-in-bad", {
      status: "active",
      password: "TestPass123!",
    });

    await expect(
      signInWithPasswordThroughApi(user.email, "WrongPass999!"),
    ).rejects.toThrow();

    const actor = await createActorClient(null);
    const { data, error } = await actor
      .from("accounts")
      .select("id")
      .eq("auth_user_id", user.authUserId);
    expect(data ?? []).toHaveLength(0);
    expect(error?.code === "42501" || (data ?? []).length === 0).toBe(true);
  });
});
