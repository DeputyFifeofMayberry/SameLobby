"use server";

import { revalidatePath } from "next/cache";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { appealSchema, reportSchema } from "@/domains/moderation/schemas";
import { trackEvent } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { createClient } from "@/lib/supabase/server";
import type { Account } from "@/domains/accounts/types";

export type ActionResult =
  | { ok: true; caseId?: string }
  | { ok: false; error: string };

type ReportAccountContext =
  | { ok: false; error: string }
  | { ok: true; account: Account };

async function requireReportAccount(): Promise<ReportAccountContext> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };
  if (account.status !== "active") {
    return { ok: false, error: "Your account cannot submit reports right now." };
  }
  const enabled = await isFeatureEnabled("reporting_enabled");
  if (!enabled) {
    return { ok: false, error: "Reporting is not enabled yet." };
  }
  return { ok: true, account };
}

function firstZodError(parsed: {
  success: false;
  error: { issues: { message?: string }[] };
}): string {
  return parsed.error.issues[0]?.message ?? "Invalid form";
}

export async function submitReport(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireReportAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = reportSchema.safeParse({
    reportedAccountId: formData.get("reportedAccountId"),
    conversationId: formData.get("conversationId")?.toString() || undefined,
    groupId: formData.get("groupId")?.toString() || undefined,
    playInvitationId: formData.get("playInvitationId")?.toString() || undefined,
    includeMessageContext: formData.get("includeMessageContext") === "on",
    category: formData.get("category"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  if (parsed.data.reportedAccountId === ctx.account.id) {
    return { ok: false, error: "You cannot report yourself." };
  }

  const supabase = await createClient();
  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      reporter_account_id: ctx.account.id,
      reported_account_id: parsed.data.reportedAccountId,
      conversation_id: parsed.data.conversationId ?? null,
      group_id: parsed.data.groupId ?? null,
      play_invitation_id: parsed.data.playInvitationId ?? null,
      include_message_context: parsed.data.includeMessageContext ?? false,
      category: parsed.data.category,
      description: parsed.data.description,
    })
    .select("id")
    .single();

  if (error) {
    const message = error.message.includes("blocked")
      ? "This report cannot be sent."
      : error.message;
    return { ok: false, error: message };
  }

  const { data: caseId, error: rpcError } = await supabase.rpc(
    "create_moderation_case_from_report",
    { p_report_id: report.id },
  );

  if (rpcError) {
    return { ok: false, error: "Could not create safety case." };
  }

  trackEvent("report_submitted");
  revalidatePath("/settings/safety");
  return { ok: true, caseId: caseId as string };
}

export async function submitAppeal(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireReportAccount();
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = appealSchema.safeParse({
    actionId: formData.get("actionId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_appeal", {
    p_action_id: parsed.data.actionId,
    p_body: parsed.data.body,
  });

  if (error) return { ok: false, error: "Could not submit appeal." };

  revalidatePath("/settings/safety");
  return { ok: true };
}

export async function exportMyData(): Promise<
  { ok: true; data: unknown } | { ok: false; error: string }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  const account = await getAccountForUser(user.id);
  if (!account) return { ok: false, error: "Account not found." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("export_account_data", {
    p_account_id: account.id,
  });

  if (error) return { ok: false, error: "Export failed." };
  return { ok: true, data };
}
