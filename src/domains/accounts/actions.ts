"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  attestationSchema,
  deletionRequestSchema,
} from "@/domains/accounts/schemas";
import { POLICY_VERSIONS } from "@/domains/accounts/types";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { trackEvent } from "@/lib/analytics/events";
import { logger } from "@/lib/logging";

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function firstZodError(parsed: {
  success: false;
  error: { issues: { message?: string }[] };
}): string {
  return parsed.error.issues[0]?.message ?? "Invalid form";
}

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function completeAttestation(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = attestationSchema.safeParse({
    adultConfirmed: formData.get("adultConfirmed") === "on",
    termsAccepted: formData.get("termsAccepted") === "on",
    privacyAccepted: formData.get("privacyAccepted") === "on",
    communityStandardsAccepted:
      formData.get("communityStandardsAccepted") === "on",
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const account = await getAccountForUser(user.id);
  if (!account) {
    return { ok: false, error: "Account not found." };
  }

  if (account.status === "deletion_pending" || account.status === "deleted") {
    return { ok: false, error: "This account cannot be updated." };
  }

  if (account.status === "active" && account.adult_attested_at) {
    redirect("/discover");
  }

  const now = new Date().toISOString();
  const headerStore = await headers();
  const ipHash = hashValue(headerStore.get("x-forwarded-for") ?? "unknown");
  const uaHash = hashValue(headerStore.get("user-agent") ?? "unknown");

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    logger.error("attestation_admin_unavailable");
    return { ok: false, error: "Could not save attestation. Try again." };
  }

  const { error: rpcError } = await admin.rpc("complete_account_attestation", {
    p_account_id: account.id,
    p_adult_attested_at: now,
    p_terms_version: POLICY_VERSIONS.terms,
    p_privacy_version: POLICY_VERSIONS.privacy,
    p_community_standards_version: POLICY_VERSIONS.communityStandards,
    p_adult_attestation_version: POLICY_VERSIONS.adultAttestation,
    p_ip_hash: ipHash,
    p_user_agent_hash: uaHash,
  });

  if (rpcError) {
    logger.error("attestation_rpc_failed", { code: rpcError.code });
    return { ok: false, error: "Could not save attestation. Try again." };
  }

  trackEvent("adult_attestation_completed");
  revalidatePath("/", "layout");
  redirect("/discover");
}

export async function requestAccountDeletion(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = deletionRequestSchema.safeParse({
    confirm: formData.get("confirm") === "on",
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const account = await getAccountForUser(user.id);
  if (!account) {
    return { ok: false, error: "Account not found." };
  }

  if (account.status === "deletion_pending") {
    return { ok: true };
  }

  if (account.status === "deleted") {
    return { ok: false, error: "This account has already been deleted." };
  }

  const scheduled = new Date();
  scheduled.setDate(scheduled.getDate() + 30);

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    logger.error("deletion_admin_unavailable");
    return { ok: false, error: "Could not request deletion. Try again." };
  }

  const { error: rpcError } = await admin.rpc("request_account_deletion", {
    p_account_id: account.id,
    p_scheduled_purge_at: scheduled.toISOString(),
  });

  if (rpcError) {
    logger.error("deletion_rpc_failed", { code: rpcError.code });
    return { ok: false, error: "Could not request deletion. Try again." };
  }

  const updated = await getAccountForUser(user.id);
  if (updated?.status !== "deletion_pending") {
    return { ok: false, error: "Could not update account status." };
  }

  try {
    await admin.from("audit_events").insert({
      actor_account_id: account.id,
      action: "account.deletion_requested",
      resource_type: "account",
      resource_id: account.id,
      metadata: { status: "requested" },
    });
  } catch {
    logger.warn("audit_event_skipped", { reason: "audit_insert_failed" });
  }

  trackEvent("account_deletion_requested");
  revalidatePath("/settings/account");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
