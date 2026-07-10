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

describe("[SL-T020][integration] @p1 current intent", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) await deleteAuthUser(user.authUserId);
    user = null;
  });

  it("upserts current_intents for an active user via actor", async () => {
    assertTestGuards();
    user = await provisionAuthUser("intent-upsert", { status: "active" });
    const admin = createFixtureAdmin();
    await admin
      .from("accounts")
      .update({
        adult_attested_at: new Date().toISOString(),
        time_zone: "America/Los_Angeles",
      })
      .eq("id", user.accountId);

    const session = await signInWithPasswordThroughApi(
      user.email,
      user.password,
    );
    const actor = await createActorClient(session);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const { error: insertError } = await actor.from("current_intents").insert({
      account_id: user.accountId,
      goal: "gaming_friendship",
      status: "active",
      expires_at: expiresAt.toISOString(),
    });
    expect(insertError).toBeNull();

    const nextExpiry = new Date();
    nextExpiry.setDate(nextExpiry.getDate() + 21);
    const { data: existing } = await actor
      .from("current_intents")
      .select("id")
      .eq("account_id", user.accountId)
      .single();

    const { error: updateError } = await actor
      .from("current_intents")
      .update({
        goal: "teammates",
        status: "active",
        expires_at: nextExpiry.toISOString(),
      })
      .eq("id", existing!.id as string);
    expect(updateError).toBeNull();

    const { data: intent } = await actor
      .from("current_intents")
      .select("goal, status")
      .eq("account_id", user.accountId)
      .single();
    expect(intent?.goal).toBe("teammates");
    expect(intent?.status).toBe("active");
  });
});
