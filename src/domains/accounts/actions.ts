"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { attestationSchema, deletionRequestSchema } from "@/domains/accounts/schemas";
import { POLICY_VERSIONS } from "@/domains/accounts/types";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { trackEvent } from "@/lib/analytics/events";
import { logger } from "@/lib/logging";

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

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
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid form" };
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

  const supabase = await createClient();
  const now = new Date().toISOString();
  const headerStore = await headers();
  const ipHash = hashValue(headerStore.get("x-forwarded-for") ?? "unknown");
  const uaHash = hashValue(headerStore.get("user-agent") ?? "unknown");

  const { error: updateError } = await supabase
    .from("accounts")
    .update({
      status: "active",
      adult_attested_at: now,
      terms_version: POLICY_VERSIONS.terms,
      privacy_version: POLICY_VERSIONS.privacy,
      community_standards_version: POLICY_VERSIONS.communityStandards,
    })
    .eq("auth_user_id", user.id);

  if (updateError) {
    logger.error("attestation_update_failed", { code: updateError.code });
    return { ok: false, error: "Could not save attestation. Try again." };
  }

  const consentRows = [
    { event_type: "adult_attestation", policy_version: POLICY_VERSIONS.terms },
    { event_type: "terms_accepted", policy_version: POLICY_VERSIONS.terms },
    { event_type: "privacy_accepted", policy_version: POLICY_VERSIONS.privacy },
    {
      event_type: "community_standards_accepted",
      policy_version: POLICY_VERSIONS.communityStandards,
    },
  ] as const;

  for (const row of consentRows) {
    const { error: consentError } = await supabase.from("consent_events").insert({
      account_id: account.id,
      event_type: row.event_type,
      policy_version: row.policy_version,
      ip_hash: ipHash,
      user_agent_hash: uaHash,
    });
    if (consentError) {
      logger.error("consent_insert_failed", { code: consentError.code });
      return { ok: false, error: "Could not record consent. Try again." };
    }
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
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid form" };
  }

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const account = await getAccountForUser(user.id);
  if (!account) {
    return { ok: false, error: "Account not found." };
  }

  const supabase = await createClient();
  const scheduled = new Date();
  scheduled.setDate(scheduled.getDate() + 30);

  const { error: deletionError } = await supabase.from("deletion_requests").insert({
    account_id: account.id,
    status: "requested",
    scheduled_purge_at: scheduled.toISOString(),
  });

  if (deletionError) {
    logger.error("deletion_request_failed", { code: deletionError.code });
    return { ok: false, error: "Could not request deletion. Try again." };
  }

  const { error: statusError } = await supabase
    .from("accounts")
    .update({ status: "deletion_pending" })
    .eq("auth_user_id", user.id);

  if (statusError) {
    return { ok: false, error: "Could not update account status." };
  }

  try {
    const admin = createAdminClient();
    await admin.from("audit_events").insert({
      actor_account_id: account.id,
      action: "account.deletion_requested",
      resource_type: "account",
      resource_id: account.id,
      metadata: { status: "requested" },
    });
  } catch {
    logger.warn("audit_event_skipped", { reason: "no_service_role" });
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
