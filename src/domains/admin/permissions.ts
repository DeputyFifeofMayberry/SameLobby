import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";

export type AdminScope =
  | "support"
  | "safety_review"
  | "catalog"
  | "billing"
  | "security_break_glass";

export type AdminContext =
  | { ok: false; error: string; status: 401 | 403 | 404 }
  | { ok: true; accountId: string; scopes: string[] };

async function loadAdminRow(accountId: string) {
  const supabase = await createClient();
  return supabase
    .from("admin_users")
    .select("scopes, mfa_enrolled_at, disabled_at")
    .eq("account_id", accountId)
    .maybeSingle();
}

async function sessionMeetsAdminMfaRequirement(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return false;
  if (data.nextLevel === "aal1") return true;
  return data.currentLevel === "aal2";
}

export async function requireAdminMembership(): Promise<AdminContext> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Unauthorized", status: 401 };

  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Unauthorized", status: 401 };

  const { data: adminRow } = await loadAdminRow(account.id);
  if (!adminRow || adminRow.disabled_at) {
    return { ok: false, error: "Not found", status: 404 };
  }

  return {
    ok: true,
    accountId: account.id,
    scopes: (adminRow.scopes as string[]) ?? [],
  };
}

export async function requireAdmin(
  requiredScope?: AdminScope,
): Promise<AdminContext> {
  const membership = await requireAdminMembership();
  if (!membership.ok) return membership;

  const { data: adminRow } = await loadAdminRow(membership.accountId);
  if (!adminRow?.mfa_enrolled_at) {
    return { ok: false, error: "MFA required", status: 403 };
  }

  const mfaOk = await sessionMeetsAdminMfaRequirement();
  if (!mfaOk) {
    return { ok: false, error: "MFA required", status: 403 };
  }

  if (requiredScope) {
    const allowed =
      membership.scopes.includes(requiredScope) ||
      membership.scopes.includes("security_break_glass");
    if (!allowed) {
      return { ok: false, error: "Forbidden", status: 403 };
    }
  }

  return membership;
}

export function scopeAllows(scopes: string[], required: AdminScope): boolean {
  return scopes.includes(required) || scopes.includes("security_break_glass");
}

export async function logAdminAudit(input: {
  actorAccountId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminClient();
  await admin.from("audit_events").insert({
    actor_account_id: input.actorAccountId,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function logEvidenceView(
  actorAccountId: string,
  caseId: string,
): Promise<void> {
  await logAdminAudit({
    actorAccountId,
    action: "evidence_viewed",
    resourceType: "moderation_case",
    resourceId: caseId,
  });
}
