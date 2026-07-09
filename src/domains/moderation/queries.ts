import "server-only";
import { createClient } from "@/lib/supabase/server";
import { LIMITED_STATUS_LABELS } from "@/domains/moderation/constants";
import type { EligibleAppeal, UserReportListItem } from "@/domains/moderation/types";

export async function listReportsForAccount(
  accountId: string,
): Promise<UserReportListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("id, status, category, created_at, moderation_case_id")
    .eq("reporter_account_id", accountId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id as string,
    caseId: (row.moderation_case_id as string) ?? null,
    status: row.status as UserReportListItem["status"],
    category: row.category as UserReportListItem["category"],
    createdAt: row.created_at as string,
    limitedStatusLabel:
      LIMITED_STATUS_LABELS[row.status as string] ?? "Under review",
  }));
}

export async function listEligibleAppeals(
  accountId: string,
): Promise<EligibleAppeal[]> {
  const supabase = await createClient();
  const { data: actions } = await supabase
    .from("moderation_actions")
    .select("id, case_id, action_type, appeal_deadline_at")
    .eq("subject_account_id", accountId)
    .gt("appeal_deadline_at", new Date().toISOString());

  if (!actions?.length) return [];

  const actionIds = actions.map((a) => a.id as string);
  const { data: existing } = await supabase
    .from("appeals")
    .select("moderation_action_id")
    .in("moderation_action_id", actionIds);

  const appealed = new Set(
    (existing ?? []).map((a) => a.moderation_action_id as string),
  );

  return actions
    .filter((a) => !appealed.has(a.id as string))
    .map((a) => ({
      actionId: a.id as string,
      caseId: a.case_id as string,
      actionType: a.action_type as EligibleAppeal["actionType"],
      appealDeadlineAt: a.appeal_deadline_at as string,
    }));
}
