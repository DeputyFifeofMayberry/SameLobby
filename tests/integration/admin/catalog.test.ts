import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import {
  completeActiveProfile,
  grantAdminScopes,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T096][integration] @p1 admin catalog", () => {
  let catalogAdmin: ProvisionedUser | null = null;
  let outsider: ProvisionedUser | null = null;

  afterEach(async () => {
    if (catalogAdmin) await deleteAuthUser(catalogAdmin.authUserId);
    if (outsider) await deleteAuthUser(outsider.authUserId);
    catalogAdmin = null;
    outsider = null;
  });

  it("allows catalog admins to read the games table", async () => {
    assertTestGuards();
    catalogAdmin = await provisionAuthUser("catalog-admin", { status: "active" });
    outsider = await provisionAuthUser("catalog-outsider", { status: "active" });
    await completeActiveProfile(catalogAdmin, "CatalogAdmin");
    await completeActiveProfile(outsider, "CatalogOutsider");
    await grantAdminScopes(catalogAdmin.accountId, ["catalog"]);

    const adminSession = await signInProvisionedUser(catalogAdmin);
    const adminActor = await createActorClient(adminSession);
    const { data: games, error } = await adminActor
      .from("games")
      .select("slug, name, is_active")
      .eq("slug", "fortnite");
    expect(error).toBeNull();
    expect((games ?? []).length).toBe(1);
    expect(games?.[0]?.name).toBeTruthy();

    const outsiderSession = await signInProvisionedUser(outsider);
    const outsiderActor = await createActorClient(outsiderSession);
    const { data: publicGames } = await outsiderActor
      .from("games")
      .select("slug")
      .eq("slug", "fortnite");
    expect((publicGames ?? []).length).toBe(1);
  });
});
