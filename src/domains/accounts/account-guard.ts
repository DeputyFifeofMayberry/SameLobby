import type { Account } from "@/domains/accounts/types";
import type { GamerProfile } from "@/domains/profile/types";
import { onboardingStepPath } from "@/domains/onboarding/constants";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

type AccountForRedirect = Pick<Account, "status"> | null;
type ProfileForRedirect = Pick<
  GamerProfile,
  "onboarding_step" | "onboarding_completed_at"
> | null;

const BLOCKED_STATUSES = new Set<Account["status"]>([
  "suspended",
  "restricted",
  "deleted",
]);

export function attestationPath(): string {
  return "/onboarding/attestation";
}

export function blockedAccountPath(): string {
  return "/settings/account";
}

function isAttestationRoute(pathname: string): boolean {
  return (
    pathname === attestationPath() ||
    pathname.startsWith(`${attestationPath()}/`)
  );
}

function isOnboardingRoute(pathname: string): boolean {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

function isProfileEditRoute(pathname: string): boolean {
  return pathname === "/profile" || pathname.startsWith("/profile/");
}

function isSettingsRoute(pathname: string): boolean {
  return pathname === blockedAccountPath() || pathname.startsWith("/settings/");
}

function isSubscriptionRoute(pathname: string): boolean {
  return pathname === "/subscription" || pathname.startsWith("/subscription/");
}

function isBillingSelfServiceRoute(pathname: string): boolean {
  return isSettingsRoute(pathname) || isSubscriptionRoute(pathname);
}

export function getAccountRouteRedirect(
  account: Account | null,
  profile: ProfileForRedirect,
  pathname: string,
): string | null {
  if (!account) {
    return "/sign-in";
  }

  if (account.status === "onboarding") {
    return isAttestationRoute(pathname) ? null : attestationPath();
  }

  if (account.status === "deletion_pending") {
    return isBillingSelfServiceRoute(pathname) ? null : blockedAccountPath();
  }

  if (BLOCKED_STATUSES.has(account.status)) {
    return isBillingSelfServiceRoute(pathname) ? null : blockedAccountPath();
  }

  if (account.status === "active" && !profile?.onboarding_completed_at) {
    const target = onboardingStepPath(profile?.onboarding_step ?? "identity");
    if (isAttestationRoute(pathname)) {
      return target;
    }
    if (isOnboardingRoute(pathname)) {
      return null;
    }
    return target;
  }

  if (
    account.status === "active" &&
    profile?.onboarding_completed_at &&
    isOnboardingRoute(pathname) &&
    !isProfileEditRoute(pathname)
  ) {
    return "/discover";
  }

  return null;
}

export function resolvePostAuthRedirect(
  account: AccountForRedirect,
  profile: ProfileForRedirect,
  next?: string | null,
): string {
  if (!account) {
    return safeRedirectPath(next, "/discover");
  }

  switch (account.status) {
    case "onboarding":
      return attestationPath();
    case "active":
      if (!profile?.onboarding_completed_at) {
        return onboardingStepPath(profile?.onboarding_step ?? "identity");
      }
      return safeRedirectPath(next, "/discover");
    case "deletion_pending":
    case "suspended":
    case "restricted":
    case "deleted":
      return blockedAccountPath();
    default:
      return safeRedirectPath(next, "/discover");
  }
}
