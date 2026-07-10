import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { createActorClient, createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

// Q06: visibility matrix is open — use migration defaults until product decision approves.
const RECOMMENDED_DEFAULTS = {
  general_availability: "match_only",
  environment_preferences: "match_only",
  compatibility_preferences: "match_only",
} as const;

describe("[SL-T023][integration] @p0 profile visibility", () => {
  let owner: ProvisionedUser | null = null;
  let outsider: ProvisionedUser | null = null;

  afterEach(async () => {
    if (owner) await deleteAuthUser(owner.authUserId);
    if (outsider) await deleteAuthUser(outsider.authUserId);
    owner = null;
    outsider = null;
  });

  it("seeds recommended default disclosure settings for new accounts", async () => {
    assertTestGuards();
    owner = await provisionAuthUser("visibility-owner", { status: "active" });
    const admin = createFixtureAdmin();

    const { data: settings } = await admin
      .from("disclosure_settings")
      .select("field_key, visibility")
      .eq("account_id", owner.accountId)
      .order("field_key");

    expect(settings).toHaveLength(3);
    for (const row of settings ?? []) {
      expect(row.visibility).toBe(
        RECOMMENDED_DEFAULTS[
          row.field_key as keyof typeof RECOMMENDED_DEFAULTS
        ],
      );
    }
  });

  it("allows owners to read disclosure settings but hides them from other users", async () => {
    assertTestGuards();
    owner = await provisionAuthUser("visibility-owner-rls", { status: "active" });
    outsider = await provisionAuthUser("visibility-outsider", {
      status: "active",
    });

    const admin = createFixtureAdmin();
    const { data: ownerSession } = await admin.auth.signInWithPassword({
      email: owner.email,
      password: owner.password,
    });
    const { data: outsiderSession } = await admin.auth.signInWithPassword({
      email: outsider.email,
      password: outsider.password,
    });

    const ownerActor = await createActorClient(ownerSession.session);
    const outsiderActor = await createActorClient(outsiderSession.session);

    const { data: ownRows } = await ownerActor
      .from("disclosure_settings")
      .select("field_key")
      .eq("account_id", owner.accountId);
    expect(ownRows).toHaveLength(3);

    const { data: leakedRows } = await outsiderActor
      .from("disclosure_settings")
      .select("field_key")
      .eq("account_id", owner.accountId);
    expect(leakedRows ?? []).toHaveLength(0);
  });
});
