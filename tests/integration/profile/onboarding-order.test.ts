import { afterEach, describe, expect, it } from "vitest";
import {
  isProfileComplete,
  profileCompletenessErrors,
} from "@/domains/profile/completeness";
import { getAccountRouteRedirect } from "@/domains/accounts/account-guard";
import type { Account } from "@/domains/accounts/types";
import { assertTestGuards } from "../../support/guards";
import { createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T016][integration] @p0 onboarding order", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) {
      await deleteAuthUser(user.authUserId);
      user = null;
    }
  });

  it("blocks discover until required onboarding fields are complete", async () => {
    assertTestGuards();
    user = await provisionAuthUser("onboarding-order", { status: "active" });
    const admin = createFixtureAdmin();

    const { data: account } = await admin
      .from("accounts")
      .select("*")
      .eq("id", user.accountId)
      .single();
    const { data: profile } = await admin
      .from("gamer_profiles")
      .select("onboarding_step, onboarding_completed_at, display_name, communication_modes")
      .eq("account_id", user.accountId)
      .single();

    expect(
      getAccountRouteRedirect(account as Account, profile, "/discover"),
    ).toBe("/onboarding/identity");

    const incomplete = {
      account: { time_zone: account?.time_zone ?? null },
      profile,
      userGames: [],
      currentIntent: null,
    };
    expect(isProfileComplete(incomplete)).toBe(false);
    expect(profileCompletenessErrors(incomplete).length).toBeGreaterThan(0);
  });
});
