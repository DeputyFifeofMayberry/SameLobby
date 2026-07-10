import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
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

describe("[SL-T090][integration] @p0 admin authorization", () => {
  let adminUser: ProvisionedUser | null = null;
  let supportAdmin: ProvisionedUser | null = null;
  let outsider: ProvisionedUser | null = null;
  let reported: ProvisionedUser | null = null;

  afterEach(async () => {
    if (adminUser) await deleteAuthUser(adminUser.authUserId);
    if (supportAdmin) await deleteAuthUser(supportAdmin.authUserId);
    if (outsider) await deleteAuthUser(outsider.authUserId);
    if (reported) await deleteAuthUser(reported.authUserId);
    adminUser = null;
    supportAdmin = null;
    outsider = null;
    reported = null;
    await setFeatureFlag("reporting_enabled", false);
  });

  async function seedOpenCase(reporter: ProvisionedUser, target: ProvisionedUser) {
    const session = await signInProvisionedUser(reporter);
    const actor = await createActorClient(session);
    const { data: report, error } = await actor
      .from("reports")
      .insert({
        reporter_account_id: reporter.accountId,
        reported_account_id: target.accountId,
        category: "spam",
        description: "Admin authz test",
      })
      .select("id")
      .single();
    if (error || !report) throw error ?? new Error("report insert failed");
    const { data: caseId, error: rpcError } = await actor.rpc(
      "create_moderation_case_from_report",
      { p_report_id: report.id as string },
    );
    if (rpcError) throw rpcError;
    return caseId as string;
  }

  it("denies non-admin actors from claiming moderation cases", async () => {
    assertTestGuards();
    await setFeatureFlag("reporting_enabled", true);
    outsider = await provisionAuthUser("admin-outsider", { status: "active" });
    reported = await provisionAuthUser("admin-target", { status: "active" });
    await completeActiveProfile(outsider, "Outsider");
    await completeActiveProfile(reported, "Target");
    const caseId = await seedOpenCase(outsider, reported);

    const session = await signInProvisionedUser(outsider);
    const actor = await createActorClient(session);
    const { error } = await actor.rpc("claim_moderation_case", {
      p_case_id: caseId,
    });
    expect(error).toBeTruthy();
  });

  it("denies support-scoped admins from claiming moderation cases", async () => {
    assertTestGuards();
    await setFeatureFlag("reporting_enabled", true);
    supportAdmin = await provisionAuthUser("admin-support", { status: "active" });
    reported = await provisionAuthUser("admin-target-support", { status: "active" });
    await completeActiveProfile(supportAdmin, "SupportAdmin");
    await completeActiveProfile(reported, "TargetSupport");
    await grantAdminScopes(supportAdmin.accountId, ["support"]);
    const caseId = await seedOpenCase(supportAdmin, reported);

    const session = await signInProvisionedUser(supportAdmin);
    const actor = await createActorClient(session);
    const { error } = await actor.rpc("claim_moderation_case", {
      p_case_id: caseId,
    });
    expect(error).toBeTruthy();
  });

  it("allows safety_review admin to claim cases when MFA fixture is enrolled", async () => {
    assertTestGuards();
    await setFeatureFlag("reporting_enabled", true);
    adminUser = await provisionAuthUser("admin-safety", { status: "active" });
    reported = await provisionAuthUser("admin-reported", { status: "active" });
    await completeActiveProfile(adminUser, "SafetyAdmin");
    await completeActiveProfile(reported, "ReportedUser");
    await grantAdminScopes(adminUser.accountId, ["safety_review"]);
    const caseId = await seedOpenCase(adminUser, reported);

    const session = await signInProvisionedUser(adminUser);
    const actor = await createActorClient(session);
    const { error } = await actor.rpc("claim_moderation_case", {
      p_case_id: caseId,
    });
    expect(error).toBeNull();
  });
});
