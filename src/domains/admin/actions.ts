"use server";

import { revalidatePath } from "next/cache";
import {
  logAdminAudit,
  logEvidenceView,
  requireAdmin,
  requireAdminMembership,
} from "@/domains/admin/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ModerationActionType } from "@/domains/moderation/types";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

export async function claimCase(caseId: string): Promise<AdminActionResult> {
  const ctx = await requireAdmin("safety_review");
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_moderation_case", {
    p_case_id: caseId,
  });
  if (error) return { ok: false, error: "Could not claim case." };

  revalidatePath("/admin/reports");
  revalidatePath(`/admin/cases/${caseId}`);
  return { ok: true };
}

export async function applyCaseAction(
  caseId: string,
  subjectAccountId: string,
  actionType: ModerationActionType,
  reasonCode: string,
): Promise<AdminActionResult> {
  const ctx = await requireAdmin("safety_review");
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { data: actionId, error } = await supabase.rpc("apply_moderation_action", {
    p_case_id: caseId,
    p_action_type: actionType,
    p_subject_account_id: subjectAccountId,
    p_reason_code: reasonCode,
  });

  if (error) return { ok: false, error: "Could not apply action." };

  const { createModerationOutcomeNotification } = await import(
    "@/domains/notifications/service"
  );
  await createModerationOutcomeNotification({
    recipientAccountId: subjectAccountId,
  });

  void actionId;
  revalidatePath(`/admin/cases/${caseId}`);
  return { ok: true };
}

export async function recordEvidenceView(caseId: string): Promise<void> {
  const ctx = await requireAdmin("safety_review");
  if (!ctx.ok) return;
  await logEvidenceView(ctx.accountId, caseId);
}

export async function setFeatureFlag(
  key: string,
  enabled: boolean,
): Promise<AdminActionResult> {
  const ctx = await requireAdmin("security_break_glass");
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const admin = createAdminClient();
  const { error } = await admin
    .from("feature_flags")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) return { ok: false, error: error.message };

  await logAdminAudit({
    actorAccountId: ctx.accountId,
    action: "feature_flag_updated",
    resourceType: "feature_flag",
    resourceId: key,
    metadata: { enabled },
  });

  revalidatePath("/admin/feature-controls");
  return { ok: true };
}

export async function syncAdminMfaEnrolled(): Promise<AdminActionResult> {
  const ctx = await requireAdminMembership();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { data: aal, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalError || !aal) {
    return { ok: false, error: "Could not verify MFA status." };
  }
  if (aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    return {
      ok: false,
      error: "Complete MFA verification in this session before continuing.",
    };
  }

  const admin = createAdminClient();
  await admin
    .from("admin_users")
    .update({ mfa_enrolled_at: new Date().toISOString() })
    .eq("account_id", ctx.accountId);

  return { ok: true };
}

export async function resolveAppeal(
  appealId: string,
  caseId: string,
  decision: "upheld" | "modified" | "reversed",
  subjectAccountId: string,
): Promise<AdminActionResult> {
  const ctx = await requireAdmin("safety_review");
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const admin = createAdminClient();
  const { error: appealError } = await admin
    .from("appeals")
    .update({ status: decision, updated_at: new Date().toISOString() })
    .eq("id", appealId);

  if (appealError) return { ok: false, error: "Could not update appeal." };

  if (decision === "reversed") {
    await admin
      .from("accounts")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", subjectAccountId);
  }

  await admin
    .from("moderation_cases")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("id", caseId);

  await logAdminAudit({
    actorAccountId: ctx.accountId,
    action: "appeal_resolved",
    resourceType: "appeal",
    resourceId: appealId,
    metadata: { decision, caseId },
  });

  revalidatePath(`/admin/cases/${caseId}`);
  return { ok: true };
}
