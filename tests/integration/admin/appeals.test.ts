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

describe("[SL-T093][integration] @p1 admin appeals", () => {
  let subject: ProvisionedUser | null = null;
  let adminUser: ProvisionedUser | null = null;

  afterEach(async () => {
    if (subject) await deleteAuthUser(subject.authUserId);
    if (adminUser) await deleteAuthUser(adminUser.authUserId);
    subject = null;
    adminUser = null;
  });

  it("lets the subject submit an appeal within the appeal window", async () => {
    assertTestGuards();
    subject = await provisionAuthUser("appeal-subject", { status: "active" });
    adminUser = await provisionAuthUser("appeal-admin", { status: "active" });
    await completeActiveProfile(subject, "AppealSubject");
    await completeActiveProfile(adminUser, "AppealAdmin");
    await grantAdminScopes(adminUser.accountId, ["safety_review"]);

    const fixtureAdmin = createFixtureAdmin();
    const { data: report } = await fixtureAdmin
      .from("reports")
      .insert({
        reporter_account_id: adminUser.accountId,
        reported_account_id: subject.accountId,
        category: "spam",
        description: "Appeal test",
        status: "case_opened",
        severity: "p3",
      })
      .select("id")
      .single();
    const { data: moderationCase } = await fixtureAdmin
      .from("moderation_cases")
      .insert({
        report_id: report!.id as string,
        status: "open",
        severity: "p3",
      })
      .select("id")
      .single();

    const adminSession = await signInProvisionedUser(adminUser);
    const adminActor = await createActorClient(adminSession);
    const { error: claimError } = await adminActor.rpc("claim_moderation_case", {
      p_case_id: moderationCase!.id as string,
    });
    expect(claimError).toBeNull();

    const { data: actionId, error: actionError } = await adminActor.rpc(
      "apply_moderation_action",
      {
        p_case_id: moderationCase!.id as string,
        p_action_type: "warn",
        p_subject_account_id: subject.accountId,
        p_reason_code: "policy_violation",
      },
    );
    expect(actionError).toBeNull();
    expect(actionId).toBeTruthy();

    const subjectSession = await signInProvisionedUser(subject);
    const subjectActor = await createActorClient(subjectSession);
    const { data: appealId, error } = await subjectActor.rpc("submit_appeal", {
      p_action_id: actionId as string,
      p_body: "I disagree with this warning.",
    });
    expect(error).toBeNull();
    expect(appealId).toBeTruthy();

    const { error: duplicateError } = await subjectActor.rpc("submit_appeal", {
      p_action_id: actionId as string,
      p_body: "I still disagree with this warning.",
    });
    expect(duplicateError).toBeTruthy();
  });
});
