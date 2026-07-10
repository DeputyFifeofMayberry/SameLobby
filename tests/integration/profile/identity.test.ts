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

describe("[SL-T017][integration] @p0 identity atomicity", () => {
  let user: ProvisionedUser | null = null;
  let other: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) await deleteAuthUser(user.authUserId);
    if (other) await deleteAuthUser(other.authUserId);
    user = null;
    other = null;
  });

  it("saves display name and time zone together for the actor", async () => {
    assertTestGuards();
    user = await provisionAuthUser("identity-save", { status: "active" });
    const session = await signInWithPasswordThroughApi(
      user.email,
      user.password,
    );
    const actor = await createActorClient(session);

    const { error: profileError } = await actor
      .from("gamer_profiles")
      .update({
        display_name: "IdentityUser",
        onboarding_step: "games",
      })
      .eq("account_id", user.accountId);
    expect(profileError).toBeNull();

    const { error: accountError } = await actor
      .from("accounts")
      .update({ time_zone: "America/Chicago" })
      .eq("id", user.accountId);
    expect(accountError).toBeNull();

    const admin = createFixtureAdmin();
    const { data: profile } = await admin
      .from("gamer_profiles")
      .select("display_name, onboarding_step")
      .eq("account_id", user.accountId)
      .single();
    const { data: account } = await admin
      .from("accounts")
      .select("time_zone")
      .eq("id", user.accountId)
      .single();

    expect(profile?.display_name).toBe("IdentityUser");
    expect(profile?.onboarding_step).toBe("games");
    expect(account?.time_zone).toBe("America/Chicago");
  });

  it("rejects a taken display name without changing time zone", async () => {
    assertTestGuards();
    other = await provisionAuthUser("identity-taken", { status: "active" });
    user = await provisionAuthUser("identity-retry", { status: "active" });
    const admin = createFixtureAdmin();

    await admin
      .from("gamer_profiles")
      .update({
        display_name: "TakenName",
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("account_id", other.accountId);

    const session = await signInWithPasswordThroughApi(
      user.email,
      user.password,
    );
    const actor = await createActorClient(session);

    const { error: profileError } = await actor
      .from("gamer_profiles")
      .update({
        display_name: "TakenName",
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("account_id", user.accountId);
    expect(profileError?.code).toBe("23505");

    const { error: accountError } = await actor
      .from("accounts")
      .update({ time_zone: "Europe/London" })
      .eq("id", user.accountId);
    expect(accountError).toBeNull();

    const { data: account } = await admin
      .from("accounts")
      .select("time_zone")
      .eq("id", user.accountId)
      .single();
    const { data: profile } = await admin
      .from("gamer_profiles")
      .select("display_name")
      .eq("account_id", user.accountId)
      .single();

    expect(account?.time_zone).toBe("Europe/London");
    expect(profile?.display_name).not.toBe("TakenName");
  });

  it("leaves recoverable state when profile saves before account time zone (D11)", async () => {
    assertTestGuards();
    user = await provisionAuthUser("identity-split", { status: "active" });
    const session = await signInWithPasswordThroughApi(
      user.email,
      user.password,
    );
    const actor = await createActorClient(session);
    const admin = createFixtureAdmin();

    const { error: profileError } = await actor
      .from("gamer_profiles")
      .update({
        display_name: "SplitWrite",
        onboarding_step: "games",
      })
      .eq("account_id", user.accountId);
    expect(profileError).toBeNull();

    const { data: beforeAccount } = await admin
      .from("accounts")
      .select("time_zone")
      .eq("id", user.accountId)
      .single();
    expect(beforeAccount?.time_zone).toBeNull();

    const { error: accountError } = await actor
      .from("accounts")
      .update({ time_zone: "America/Denver" })
      .eq("id", user.accountId);
    expect(accountError).toBeNull();

    const { data: profile } = await admin
      .from("gamer_profiles")
      .select("display_name, onboarding_step")
      .eq("account_id", user.accountId)
      .single();
    const { data: account } = await admin
      .from("accounts")
      .select("time_zone")
      .eq("id", user.accountId)
      .single();

    expect(profile?.display_name).toBe("SplitWrite");
    expect(profile?.onboarding_step).toBe("games");
    expect(account?.time_zone).toBe("America/Denver");
  });
});
