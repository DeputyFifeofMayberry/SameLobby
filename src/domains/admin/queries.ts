import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ModerationSeverity } from "@/domains/moderation/types";

export type AdminCaseListItem = {
  id: string;
  reportId: string;
  status: string;
  severity: ModerationSeverity;
  createdAt: string;
  claimedAt: string | null;
  isOverdue: boolean;
};

export type AdminDashboardStats = {
  openBySeverity: Record<ModerationSeverity, number>;
  overdueP1: number;
  overdueP2: number;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const admin = createAdminClient();
  const { data: cases } = await admin
    .from("moderation_cases")
    .select("severity, status, created_at")
    .in("status", ["open", "investigating", "appealed"]);

  const openBySeverity: AdminDashboardStats["openBySeverity"] = {
    p0: 0,
    p1: 0,
    p2: 0,
    p3: 0,
  };
  let overdueP1 = 0;
  let overdueP2 = 0;
  const now = Date.now();

  for (const row of cases ?? []) {
    const severity = row.severity as ModerationSeverity;
    openBySeverity[severity] += 1;
    const ageHours = (now - new Date(row.created_at as string).getTime()) / 3_600_000;
    if (severity === "p1" && ageHours > 24) overdueP1 += 1;
    if (severity === "p2" && ageHours > 72) overdueP2 += 1;
  }

  return { openBySeverity, overdueP1, overdueP2 };
}

export async function listOpenCases(): Promise<AdminCaseListItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("moderation_cases")
    .select("id, report_id, status, severity, created_at, claimed_at")
    .in("status", ["open", "investigating", "appealed"])
    .order("created_at", { ascending: true });

  const now = Date.now();
  return (data ?? []).map((row) => {
    const severity = row.severity as ModerationSeverity;
    const ageHours =
      (now - new Date(row.created_at as string).getTime()) / 3_600_000;
    const isOverdue =
      (severity === "p1" && ageHours > 24) || (severity === "p2" && ageHours > 72);
    return {
      id: row.id as string,
      reportId: row.report_id as string,
      status: row.status as string,
      severity,
      createdAt: row.created_at as string,
      claimedAt: (row.claimed_at as string) ?? null,
      isOverdue,
    };
  });
}

export async function getCaseDetail(caseId: string) {
  const admin = createAdminClient();
  const { data: caseRow } = await admin
    .from("moderation_cases")
    .select("*")
    .eq("id", caseId)
    .maybeSingle();

  if (!caseRow) return null;

  const [{ data: report }, { data: evidence }, { data: actions }] =
    await Promise.all([
      admin.from("reports").select("*").eq("id", caseRow.report_id).maybeSingle(),
      admin
        .from("moderation_evidence")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true }),
      admin
        .from("moderation_actions")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false }),
    ]);

  return { case: caseRow, report, evidence: evidence ?? [], actions: actions ?? [] };
}

export async function listAuditEvents(limit = 50) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("audit_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function listFeatureFlags() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("feature_flags")
    .select("key, enabled")
    .in("key", [
      "registration_open",
      "connection_requests_enabled",
      "links_in_messages",
      "reporting_enabled",
    ]);
  return data ?? [];
}

export async function getAppealsForCase(caseId: string) {
  const admin = createAdminClient();
  const { data: actions } = await admin
    .from("moderation_actions")
    .select("id")
    .eq("case_id", caseId);

  const actionIds = (actions ?? []).map((a) => a.id as string);
  if (actionIds.length === 0) return [];

  const { data } = await admin
    .from("appeals")
    .select("*")
    .in("moderation_action_id", actionIds)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getUserAdminSummary(accountId: string) {
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("accounts")
    .select("id, status, email, created_at")
    .eq("id", accountId)
    .maybeSingle();

  if (!account) return null;

  const { data: profile } = await admin
    .from("gamer_profiles")
    .select("display_name")
    .eq("account_id", accountId)
    .maybeSingle();

  const { data: actions } = await admin
    .from("moderation_actions")
    .select("id, action_type, reason_code, created_at, case_id")
    .eq("subject_account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: reports } = await admin
    .from("reports")
    .select("id, status, category, created_at, moderation_case_id")
    .or(`reported_account_id.eq.${accountId},reporter_account_id.eq.${accountId}`)
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    account,
    displayName: (profile?.display_name as string) ?? "Unknown",
    actions: actions ?? [],
    reports: reports ?? [],
  };
}
