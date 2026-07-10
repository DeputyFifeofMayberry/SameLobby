import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  completeActiveProfile,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient, createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T086][integration] @p0 moderation report", () => {
  let reporter: ProvisionedUser | null = null;
  let reported: ProvisionedUser | null = null;

  afterEach(async () => {
    if (reporter) await deleteAuthUser(reporter.authUserId);
    if (reported) await deleteAuthUser(reported.authUserId);
    reporter = null;
    reported = null;
    await setFeatureFlag("reporting_enabled", false);
  });

  it("creates a report and opens a moderation case", async () => {
    assertTestGuards();
    await setFeatureFlag("reporting_enabled", true);
    reporter = await provisionAuthUser("mod-reporter", { status: "active" });
    reported = await provisionAuthUser("mod-reported", { status: "active" });
    await completeActiveProfile(reporter, "Reporter");
    await completeActiveProfile(reported, "Reported");

    const session = await signInProvisionedUser(reporter);
    const actor = await createActorClient(session);
    const { data: report, error } = await actor
      .from("reports")
      .insert({
        reporter_account_id: reporter.accountId,
        reported_account_id: reported.accountId,
        category: "spam",
        description: "Unwanted messages",
      })
      .select("id")
      .single();
    expect(error).toBeNull();

    const { data: caseId, error: rpcError } = await actor.rpc(
      "create_moderation_case_from_report",
      { p_report_id: report!.id as string },
    );
    expect(rpcError).toBeNull();
    expect(caseId).toBeTruthy();

    const admin = createFixtureAdmin();
    const { data: moderationCase } = await admin
      .from("moderation_cases")
      .select("status, report_id")
      .eq("id", caseId as string)
      .single();
    expect(moderationCase?.report_id).toBe(report!.id);
    expect(moderationCase?.status).toBeTruthy();
  });
});
