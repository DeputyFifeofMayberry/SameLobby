import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import {
  getFortniteCatalogIds,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T024][integration] @p1 user games", () => {
  let owner: ProvisionedUser | null = null;
  let outsider: ProvisionedUser | null = null;

  afterEach(async () => {
    if (owner) await deleteAuthUser(owner.authUserId);
    if (outsider) await deleteAuthUser(outsider.authUserId);
    owner = null;
    outsider = null;
  });

  it("upserts user_games for the actor and denies outsider reads", async () => {
    assertTestGuards();
    owner = await provisionAuthUser("games-owner", { status: "active" });
    outsider = await provisionAuthUser("games-outsider", { status: "active" });
    const { gameId, platformId } = await getFortniteCatalogIds();

    const ownerSession = await signInProvisionedUser(owner);
    const ownerActor = await createActorClient(ownerSession);
    const { error: upsertError } = await ownerActor.from("user_games").upsert(
      {
        account_id: owner.accountId,
        game_id: gameId,
        platform_id: platformId,
        is_active: true,
        sort_order: 0,
      },
      { onConflict: "account_id,game_id,platform_id" },
    );
    expect(upsertError).toBeNull();

    const { data: ownGames } = await ownerActor
      .from("user_games")
      .select("game_id, platform_id, is_active")
      .eq("account_id", owner.accountId);
    expect(ownGames).toHaveLength(1);
    expect(ownGames?.[0]?.is_active).toBe(true);

    const outsiderSession = await signInProvisionedUser(outsider);
    const outsiderActor = await createActorClient(outsiderSession);
    const { data: leaked } = await outsiderActor
      .from("user_games")
      .select("id")
      .eq("account_id", owner.accountId);
    expect(leaked ?? []).toHaveLength(0);
  });
});
