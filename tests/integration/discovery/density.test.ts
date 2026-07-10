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
import { getCohortSnapshot } from "@/domains/discovery/queries";
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

describe("[SL-T033][integration] @p1 cohort density", () => {
  let viewer: ProvisionedUser | null = null;
  let peer: ProvisionedUser | null = null;

  afterEach(async () => {
    if (viewer) await deleteAuthUser(viewer.authUserId);
    if (peer) await deleteAuthUser(peer.authUserId);
    viewer = null;
    peer = null;
    await setFeatureFlag("discovery_enabled", false);
  });

  it("returns a cohort snapshot with qualified count for discoverable users", async () => {
    assertTestGuards();
    await setFeatureFlag("discovery_enabled", true);
    viewer = await provisionAuthUser("density-viewer", { status: "active" });
    peer = await provisionAuthUser("density-peer", { status: "active" });
    await completeActiveProfile(viewer, "DensityViewer");
    await completeActiveProfile(peer, "DensityPeer");
    await addUserGame(viewer);
    await addUserGame(peer);

    const admin = createFixtureAdmin();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    for (const user of [viewer, peer]) {
      await admin.from("current_intents").insert({
        account_id: user!.accountId,
        goal: "gaming_friendship",
        status: "active",
        expires_at: expiresAt.toISOString(),
      });
    }

    const snapshot = await getCohortSnapshot(viewer.accountId);
    expect(snapshot).not.toBeNull();
    expect(snapshot!.cohortKey).toContain("en:");
    expect(snapshot!.qualifiedCount).toBeGreaterThanOrEqual(2);
    expect(["below_threshold", "demand_collecting", "qualified", "active_discovery"]).toContain(
      snapshot!.status,
    );
  });
});
