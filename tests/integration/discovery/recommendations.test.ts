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
import {
  getActiveRecommendations,
  refreshRecommendations,
  searchDiscoverableProfiles,
} from "@/domains/discovery/queries";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  addUserGame,
  completeActiveProfile,
} from "../../support/integration-fixtures";
import { createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T031][integration] @p1 discovery recommendations", () => {
  let viewer: ProvisionedUser | null = null;
  let target: ProvisionedUser | null = null;

  afterEach(async () => {
    if (viewer) await deleteAuthUser(viewer.authUserId);
    if (target) await deleteAuthUser(target.authUserId);
    viewer = null;
    target = null;
    await setFeatureFlag("discovery_enabled", false);
  });

  it("refreshes recommendations and reads discovery_recommendations for the viewer", async () => {
    assertTestGuards();
    await setFeatureFlag("discovery_enabled", true);
    viewer = await provisionAuthUser("rec-viewer", { status: "active" });
    target = await provisionAuthUser("rec-target", { status: "active" });
    await completeActiveProfile(viewer, "RecViewer");
    await completeActiveProfile(target, "RecTarget");
    await addUserGame(viewer);
    await addUserGame(target);

    const admin = createFixtureAdmin();
    const testLocale = `rec-${crypto.randomUUID().slice(0, 8)}`;
    for (const user of [viewer, target]) {
      await admin
        .from("accounts")
        .update({ locale: testLocale })
        .eq("id", user!.accountId);
    }
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    for (const user of [viewer, target]) {
      const { error } = await admin.from("current_intents").insert({
        account_id: user!.accountId,
        goal: "gaming_friendship",
        status: "active",
        expires_at: expiresAt.toISOString(),
      });
      expect(error).toBeNull();
    }

    const eligible = await searchDiscoverableProfiles(viewer!.accountId, {});
    expect(eligible.some((c) => c.accountId === target!.accountId)).toBe(true);

    await refreshRecommendations(viewer!.accountId);

    const { data: rows, error: readError } = await admin
      .from("discovery_recommendations")
      .select("recommended_account_id, reason_codes")
      .eq("viewer_account_id", viewer!.accountId);
    expect(readError).toBeNull();
    expect((rows ?? []).length).toBeGreaterThan(0);
    expect(rows?.some((r) => r.recommended_account_id === target!.accountId)).toBe(
      true,
    );

    const cards = await getActiveRecommendations(viewer!.accountId);
    expect(cards.some((c) => c.accountId === target!.accountId)).toBe(true);
  });
});
