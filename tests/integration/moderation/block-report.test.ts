import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  completeActiveProfile,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T088][integration] @p0 block report", () => {
  let reporter: ProvisionedUser | null = null;
  let reported: ProvisionedUser | null = null;

  afterEach(async () => {
    if (reporter) await deleteAuthUser(reporter.authUserId);
    if (reported) await deleteAuthUser(reported.authUserId);
    reporter = null;
    reported = null;
    await setFeatureFlag("reporting_enabled", false);
  });

  it("rejects reports when a block exists (Q03 current behavior)", async () => {
    assertTestGuards();
    await setFeatureFlag("reporting_enabled", true);
    reporter = await provisionAuthUser("block-rep-a", { status: "active" });
    reported = await provisionAuthUser("block-rep-b", { status: "active" });
    await completeActiveProfile(reporter, "BlockReporter");
    await completeActiveProfile(reported, "BlockReported");

    const session = await signInProvisionedUser(reporter);
    const actor = await createActorClient(session);
    await actor.from("blocks").insert({
      blocker_account_id: reporter.accountId,
      blocked_account_id: reported.accountId,
    });

    const { error } = await actor.from("reports").insert({
      reporter_account_id: reporter.accountId,
      reported_account_id: reported.accountId,
      category: "harassment",
      description: "After block",
    });

    // Q03 open — current DB enforcement blocks reports after block.
    expect(error?.message.toLowerCase()).toContain("block");
  });
});
