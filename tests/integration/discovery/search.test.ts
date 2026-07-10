import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import { createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T030][integration] @p0 discovery search", () => {
  let viewer: ProvisionedUser | null = null;
  let target: ProvisionedUser | null = null;

  afterEach(async () => {
    if (viewer) await deleteAuthUser(viewer.authUserId);
    if (target) await deleteAuthUser(target.authUserId);
    viewer = null;
    target = null;
    await setFeatureFlag("discovery_enabled", false);
  });

  async function makeDiscoverable(user: ProvisionedUser, displayName: string) {
    const admin = createFixtureAdmin();
    const { data: fortnite } = await admin
      .from("games")
      .select("id")
      .eq("slug", "fortnite")
      .single();
    const { data: pc } = await admin
      .from("platforms")
      .select("id")
      .eq("slug", "pc")
      .single();
    if (!fortnite?.id || !pc?.id) {
      throw new Error("catalog fixtures missing fortnite/pc");
    }

    await admin
      .from("accounts")
      .update({
        status: "active",
        adult_attested_at: new Date().toISOString(),
        time_zone: "America/Los_Angeles",
        locale: "en",
      })
      .eq("id", user.accountId);

    await admin
      .from("gamer_profiles")
      .update({
        display_name: displayName,
        communication_modes: ["same_lobby_text"],
        onboarding_step: "preview",
        onboarding_completed_at: new Date().toISOString(),
        discovery_paused_at: null,
      })
      .eq("account_id", user.accountId);

    await admin.from("user_games").upsert(
      {
        account_id: user.accountId,
        game_id: fortnite.id,
        platform_id: pc.id,
        is_active: true,
        sort_order: 0,
      },
      { onConflict: "account_id,game_id,platform_id" },
    );

    await admin.from("current_intents").insert({
      account_id: user.accountId,
      goal: "gaming_friendship",
      status: "active",
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  it("returns discoverable profiles matching a display-name query", async () => {
    assertTestGuards();
    await setFeatureFlag("discovery_enabled", true);

    viewer = await provisionAuthUser("discover-viewer");
    target = await provisionAuthUser("discover-target");
    await makeDiscoverable(viewer!, "SearchViewer");
    await makeDiscoverable(target!, "SearchTarget");

    const admin = createFixtureAdmin();
    const { data: profiles } = await admin
      .from("gamer_profiles")
      .select("account_id, display_name, onboarding_completed_at, discovery_paused_at")
      .not("onboarding_completed_at", "is", null)
      .is("discovery_paused_at", null)
      .ilike("display_name", "%SearchTarget%");

    expect(profiles?.some((p) => p.account_id === target!.accountId)).toBe(true);
    expect(profiles?.some((p) => p.account_id === viewer!.accountId)).toBe(
      false,
    );
  });
});
