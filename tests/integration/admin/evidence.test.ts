import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import {
  completeActiveProfile,
  grantAdminScopes,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient, createFixtureAdmin } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T092][integration] @p0 admin evidence", () => {
  let adminUser: ProvisionedUser | null = null;
  let reporter: ProvisionedUser | null = null;
  let reported: ProvisionedUser | null = null;
  let bystander: ProvisionedUser | null = null;

  afterEach(async () => {
    if (adminUser) await deleteAuthUser(adminUser.authUserId);
    if (reporter) await deleteAuthUser(reporter.authUserId);
    if (reported) await deleteAuthUser(reported.authUserId);
    if (bystander) await deleteAuthUser(bystander.authUserId);
    adminUser = null;
    reporter = null;
    reported = null;
    bystander = null;
  });

  it("restricts moderation evidence to safety admins", async () => {
    assertTestGuards();
    reporter = await provisionAuthUser("ev-reporter", { status: "active" });
    reported = await provisionAuthUser("ev-reported", { status: "active" });
    bystander = await provisionAuthUser("ev-bystander", { status: "active" });
    adminUser = await provisionAuthUser("ev-admin", { status: "active" });
    await completeActiveProfile(reporter, "EvReporter");
    await completeActiveProfile(reported, "EvReported");
    await completeActiveProfile(bystander, "EvBystander");
    await completeActiveProfile(adminUser, "EvAdmin");
    await grantAdminScopes(adminUser.accountId, ["safety_review"]);

    const admin = createFixtureAdmin();
    const { data: report } = await admin
      .from("reports")
      .insert({
        reporter_account_id: reporter.accountId,
        reported_account_id: reported.accountId,
        category: "spam",
        description: "Evidence test",
        status: "case_opened",
        severity: "p3",
      })
      .select("id")
      .single();
    const { data: moderationCase } = await admin
      .from("moderation_cases")
      .insert({
        report_id: report!.id as string,
        status: "open",
        severity: "p3",
      })
      .select("id")
      .single();
    await admin.from("moderation_evidence").insert({
      case_id: moderationCase!.id as string,
      kind: "report_description",
      body: "Reporter says spam in chat",
    });

    const bystanderSession = await signInProvisionedUser(bystander);
    const bystanderActor = await createActorClient(bystanderSession);
    const { data: leaked } = await bystanderActor
      .from("moderation_evidence")
      .select("id");
    expect(leaked ?? []).toHaveLength(0);

    const adminSession = await signInProvisionedUser(adminUser);
    const adminActor = await createActorClient(adminSession);
    const { data: evidence } = await adminActor
      .from("moderation_evidence")
      .select("body")
      .eq("case_id", moderationCase!.id as string);
    expect((evidence ?? []).length).toBeGreaterThan(0);
  });
});
