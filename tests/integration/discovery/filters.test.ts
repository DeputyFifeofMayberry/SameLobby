import { vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/server", async () => {
  const { createFixtureAdmin } = await import("../../support/supabase");
  return {
    createClient: async () => createFixtureAdmin(),
  };
});

vi.mock("@/lib/supabase/admin", async () => {
  const { createFixtureAdmin } = await import("../../support/supabase");
  return {
    createAdminClient: () => createFixtureAdmin(),
  };
});

import { afterEach, describe, expect, it } from "vitest";
import { searchDiscoverableProfiles } from "@/domains/discovery/queries";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import { createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T036][integration] @p1 discovery filters", () => {
  let viewer: ProvisionedUser | null = null;
  let fortniteUser: ProvisionedUser | null = null;
  let haloUser: ProvisionedUser | null = null;

  afterEach(async () => {
    if (viewer) await deleteAuthUser(viewer.authUserId);
    if (fortniteUser) await deleteAuthUser(fortniteUser.authUserId);
    if (haloUser) await deleteAuthUser(haloUser.authUserId);
    viewer = null;
    fortniteUser = null;
    haloUser = null;
    await setFeatureFlag("discovery_enabled", false);
  });

  async function makeDiscoverableWithGame(
    user: ProvisionedUser,
    displayName: string,
    gameSlug: string,
    platformSlug: string,
  ) {
    const admin = createFixtureAdmin();
    const { data: game } = await admin
      .from("games")
      .select("id")
      .eq("slug", gameSlug)
      .single();
    const { data: platform } = await admin
      .from("platforms")
      .select("id")
      .eq("slug", platformSlug)
      .single();
    if (!game?.id || !platform?.id) {
      throw new Error(`catalog fixtures missing ${gameSlug}/${platformSlug}`);
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
        game_id: game.id,
        platform_id: platform.id,
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

    return { gameId: game.id as string, platformId: platform.id as string };
  }

  it("filters discoverable profiles by game and platform", async () => {
    assertTestGuards();
    await setFeatureFlag("discovery_enabled", true);
    viewer = await provisionAuthUser("filter-viewer", { status: "active" });
    fortniteUser = await provisionAuthUser("filter-fortnite", { status: "active" });
    haloUser = await provisionAuthUser("filter-halo", { status: "active" });

    const viewerCatalog = await makeDiscoverableWithGame(
      viewer!,
      "FilterViewer",
      "fortnite",
      "pc",
    );
    await makeDiscoverableWithGame(fortniteUser!, "FilterFortnite", "fortnite", "pc");
    await makeDiscoverableWithGame(haloUser!, "FilterHalo", "halo-infinite", "xbox");

    const fortniteResults = await searchDiscoverableProfiles(viewer!.accountId, {
      gameId: viewerCatalog.gameId,
      platformId: viewerCatalog.platformId,
    });
    const accountIds = fortniteResults.map((r) => r.accountId);
    expect(accountIds).toContain(fortniteUser!.accountId);
    expect(accountIds).not.toContain(haloUser!.accountId);
  });
});
