"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import {
  communicationStepSchema,
  displayNameSchema,
  goalStepSchema,
  identityStepSchema,
  MAX_ACTIVE_USER_GAMES,
} from "@/domains/profile/schemas";
import {
  isProfileComplete,
  profileCompletenessErrors,
} from "@/domains/profile/completeness";
import { getCurrentIntent, getGamerProfileForAccount } from "@/domains/profile/queries";
import { getUserGamesForAccount } from "@/domains/games/queries";
import { onboardingStepPath } from "@/domains/onboarding/constants";
import type { CommunicationMode, OnboardingStep } from "@/domains/profile/types";
import { trackEvent } from "@/lib/analytics/events";

export type ActionResult = { ok: true } | { ok: false; error: string };

function firstZodError(parsed: {
  success: false;
  error: { issues: { message?: string }[] };
}): string {
  return parsed.error.issues[0]?.message ?? "Invalid form";
}

import type { Account } from "@/domains/accounts/types";
import type { User } from "@supabase/supabase-js";

type ActiveAccountContext =
  | { error: string }
  | { user: User; account: Account };

async function requireActiveAccount(): Promise<ActiveAccountContext> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "You must be signed in." as const };
  }
  const account = await getAccountForUser(user.id);
  if (!account) {
    return { error: "Account not found." as const };
  }
  if (account.status !== "active") {
    return { error: "Complete attestation before continuing." as const };
  }
  return { user, account };
}

async function updateOnboardingStep(accountId: string, step: OnboardingStep) {
  const supabase = await createClient();
  await supabase
    .from("gamer_profiles")
    .update({ onboarding_step: step })
    .eq("account_id", accountId);
}

export async function saveIdentityStep(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireActiveAccount();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const parsed = identityStepSchema.safeParse({
    displayName: formData.get("displayName"),
    timeZone: formData.get("timeZone"),
  });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from("gamer_profiles")
    .update({
      display_name: parsed.data.displayName,
      onboarding_step: "games",
    })
    .eq("account_id", ctx.account.id);

  if (profileError) {
    if (profileError.code === "23505") {
      return { ok: false, error: "That display name is already taken." };
    }
    return { ok: false, error: "Could not save profile. Try again." };
  }

  const { error: accountError } = await supabase
    .from("accounts")
    .update({ time_zone: parsed.data.timeZone })
    .eq("id", ctx.account.id);

  if (accountError) {
    return { ok: false, error: "Could not save time zone. Try again." };
  }

  trackEvent("onboarding_step_completed", { step: "identity" });
  revalidatePath("/", "layout");
  redirect(onboardingStepPath("games"));
}

export async function saveGamesStep(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireActiveAccount();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const gameId = String(formData.get("gameId") ?? "");
  const platformId = String(formData.get("platformId") ?? "");
  if (!gameId || !platformId) {
    return { ok: false, error: "Select a game and platform." };
  }

  const existing = await getUserGamesForAccount(ctx.account.id);
  if (existing.length >= MAX_ACTIVE_USER_GAMES) {
    return {
      ok: false,
      error: `You can have at most ${MAX_ACTIVE_USER_GAMES} active games.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("user_games").upsert(
    {
      account_id: ctx.account.id,
      game_id: gameId,
      platform_id: platformId,
      is_active: true,
      sort_order: existing.length,
    },
    { onConflict: "account_id,game_id,platform_id" },
  );

  if (error) {
    return { ok: false, error: "Could not save game selection. Try again." };
  }

  await updateOnboardingStep(ctx.account.id, "communication");
  trackEvent("onboarding_step_completed", { step: "games" });
  revalidatePath("/", "layout");
  redirect(onboardingStepPath("communication"));
}

export async function saveCommunicationStep(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireActiveAccount();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const modes = formData.getAll("modes").map(String) as CommunicationMode[];
  const parsed = communicationStepSchema.safeParse({ modes });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gamer_profiles")
    .update({
      communication_modes: parsed.data.modes,
      onboarding_step: "goal",
    })
    .eq("account_id", ctx.account.id);

  if (error) {
    return { ok: false, error: "Could not save communication modes." };
  }

  trackEvent("onboarding_step_completed", { step: "communication" });
  revalidatePath("/", "layout");
  redirect(onboardingStepPath("goal"));
}

export async function saveGoalStep(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireActiveAccount();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const parsed = goalStepSchema.safeParse({ goal: formData.get("goal") });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const supabase = await createClient();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const existing = await getCurrentIntent(ctx.account.id);
  const intentError = existing
    ? (
        await supabase
          .from("current_intents")
          .update({
            goal: parsed.data.goal,
            status: "active",
            expires_at: expiresAt.toISOString(),
          })
          .eq("id", existing.id)
      ).error
    : (
        await supabase.from("current_intents").insert({
          account_id: ctx.account.id,
          goal: parsed.data.goal,
          status: "active",
          expires_at: expiresAt.toISOString(),
        })
      ).error;

  if (intentError) {
    return { ok: false, error: "Could not save current goal." };
  }

  await updateOnboardingStep(ctx.account.id, "availability");
  trackEvent("onboarding_step_completed", { step: "goal" });
  revalidatePath("/", "layout");
  redirect(onboardingStepPath("availability"));
}

export async function skipAvailabilityStep(): Promise<void> {
  const ctx = await requireActiveAccount();
  if ("error" in ctx) {
    redirect("/sign-in");
  }

  await updateOnboardingStep(ctx.account.id, "preview");
  redirect(onboardingStepPath("preview"));
}

export async function saveAvailabilityStep(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireActiveAccount();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");

  if (
    Number.isNaN(dayOfWeek) ||
    dayOfWeek < 0 ||
    dayOfWeek > 6 ||
    !startTime ||
    !endTime
  ) {
    return { ok: false, error: "Provide a valid availability window." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("availability_windows").insert({
    account_id: ctx.account.id,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
  });

  if (error) {
    return { ok: false, error: "Could not save availability." };
  }

  await updateOnboardingStep(ctx.account.id, "preview");
  trackEvent("onboarding_step_completed", { step: "availability" });
  revalidatePath("/", "layout");
  redirect(onboardingStepPath("preview"));
}

export async function completeOnboarding(
  _prev: ActionResult | null,
  _formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireActiveAccount();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const [profile, userGames, currentIntent] = await Promise.all([
    getGamerProfileForAccount(ctx.account.id),
    getUserGamesForAccount(ctx.account.id),
    getCurrentIntent(ctx.account.id),
  ]);

  const completeness = {
    account: ctx.account,
    profile,
    userGames,
    currentIntent,
  };

  if (!isProfileComplete(completeness)) {
    return {
      ok: false,
      error: profileCompletenessErrors(completeness).join(" "),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gamer_profiles")
    .update({
      onboarding_completed_at: new Date().toISOString(),
      onboarding_step: "preview",
    })
    .eq("account_id", ctx.account.id);

  if (error) {
    return { ok: false, error: "Could not complete onboarding." };
  }

  trackEvent("onboarding_step_completed", { step: "preview" });
  trackEvent("onboarding_completed");
  revalidatePath("/", "layout");
  redirect("/discover");
}

export async function updateProfileIdentity(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireActiveAccount();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const parsed = identityStepSchema.safeParse({
    displayName: formData.get("displayName"),
    timeZone: formData.get("timeZone"),
  });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const nameCheck = displayNameSchema.safeParse(parsed.data.displayName);
  if (!nameCheck.success) {
    return { ok: false, error: firstZodError(nameCheck) };
  }

  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from("gamer_profiles")
    .update({ display_name: parsed.data.displayName })
    .eq("account_id", ctx.account.id);

  if (profileError?.code === "23505") {
    return { ok: false, error: "That display name is already taken." };
  }
  if (profileError) {
    return { ok: false, error: "Could not update profile." };
  }

  await supabase
    .from("accounts")
    .update({ time_zone: parsed.data.timeZone })
    .eq("id", ctx.account.id);

  revalidatePath("/profile");
  return { ok: true };
}

export async function updateProfileCommunication(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireActiveAccount();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const modes = formData.getAll("modes").map(String) as CommunicationMode[];
  const parsed = communicationStepSchema.safeParse({ modes });
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("gamer_profiles")
    .update({ communication_modes: parsed.data.modes })
    .eq("account_id", ctx.account.id);

  if (error) {
    return { ok: false, error: "Could not update communication modes." };
  }

  revalidatePath("/profile");
  return { ok: true };
}

export async function updateDisclosureVisibility(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireActiveAccount();
  if ("error" in ctx) return { ok: false, error: ctx.error };

  const fieldKey = String(formData.get("fieldKey") ?? "");
  const visibility = String(formData.get("visibility") ?? "");
  if (!fieldKey || !visibility) {
    return { ok: false, error: "Invalid visibility update." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("disclosure_settings")
    .update({ visibility })
    .eq("account_id", ctx.account.id)
    .eq("field_key", fieldKey);

  if (error) {
    return { ok: false, error: "Could not update visibility." };
  }

  revalidatePath("/profile");
  return { ok: true };
}
