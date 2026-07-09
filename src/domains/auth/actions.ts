"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolvePostAuthRedirect } from "@/domains/accounts/account-guard";
import { getAccountForUser } from "@/domains/accounts/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/domains/auth/schemas";
import { trackEvent } from "@/lib/analytics/events";
import { isRegistrationCapReached } from "@/lib/registration-cap";
import { logger } from "@/lib/logging";

export type AuthActionResult = { ok: true } | { ok: false; error: string };

function firstZodError(parsed: {
  success: false;
  error: { issues: { message?: string }[] };
}): string {
  return parsed.error.issues[0]?.message ?? "Invalid form";
}

async function rateLimitKey(suffix: string): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for") ?? "unknown";
  return `${suffix}:${forwarded.split(",")[0]?.trim() ?? "unknown"}`;
}

function siteUrl(): string {
  return env.NEXT_PUBLIC_SITE_URL;
}

function authCallbackUrl(next?: string | null): string {
  const base = `${siteUrl()}/auth/callback`;
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return `${base}?next=${encodeURIComponent(next)}`;
  }
  return base;
}

export async function signUpWithPassword(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const registrationOpen = await isFeatureEnabled("registration_open");
  if (!registrationOpen) {
    return {
      ok: false,
      error: "New registration is temporarily paused. Try again later.",
    };
  }

  if (await isRegistrationCapReached()) {
    return {
      ok: false,
      error: "Registration is full. Try again later.",
    };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const limit = checkRateLimit(
    await rateLimitKey(`sign-up:${parsed.data.email}`),
    5,
    60_000,
  );
  if (!limit.allowed) {
    return {
      ok: false,
      error: "Too many attempts. Please wait and try again.",
    };
  }

  trackEvent("sign_up_started");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: authCallbackUrl(),
    },
  });

  if (error) {
    logger.warn("sign_up_failed", { code: error.code });
    return { ok: false, error: "Could not create account. Try again." };
  }

  if (data.session) {
    trackEvent("sign_up_completed");
    trackEvent("account_created");
    const account = data.user ? await getAccountForUser(data.user.id) : null;
    const profile = account
      ? await getGamerProfileForAccount(account.id)
      : null;
    redirect(resolvePostAuthRedirect(account, profile));
  }

  trackEvent("sign_up_completed");
  redirect("/sign-up/check-email");
}

export async function signInWithPassword(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const limit = checkRateLimit(
    await rateLimitKey(`sign-in:${parsed.data.email}`),
    10,
    60_000,
  );
  if (!limit.allowed) {
    return {
      ok: false,
      error: "Too many attempts. Please wait and try again.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { ok: false, error: "Invalid email or password." };
  }

  trackEvent("sign_in_completed");

  const next = formData.get("next");
  const nextPath =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : null;
  const account = await getAccountForUser(data.user.id);
  const profile = account ? await getGamerProfileForAccount(account.id) : null;
  redirect(resolvePostAuthRedirect(account, profile, nextPath));
}

export async function requestPasswordReset(
  _prev: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed) };
  }

  const limit = checkRateLimit(
    await rateLimitKey(`forgot:${parsed.data.email}`),
    5,
    60_000,
  );
  if (!limit.allowed) {
    return {
      ok: false,
      error: "Too many attempts. Please wait and try again.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${siteUrl()}/auth/callback?type=recovery`,
    },
  );

  if (error) {
    logger.warn("password_reset_failed", { code: error.code });
  }

  trackEvent("password_reset_requested");
  return { ok: true };
}
