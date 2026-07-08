import type { Account, AccountStatus } from "@/domains/accounts/types";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

type AccountForRedirect = Pick<Account, "status"> | null;

const BLOCKED_STATUSES = new Set<AccountStatus>([
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

function isSettingsRoute(pathname: string): boolean {
  return pathname === blockedAccountPath() || pathname.startsWith("/settings/");
}

export function getAccountRouteRedirect(
  account: Account | null,
  pathname: string,
): string | null {
  if (!account) {
    return "/sign-in";
  }

  if (account.status === "onboarding") {
    return isAttestationRoute(pathname) ? null : attestationPath();
  }

  if (account.status === "deletion_pending") {
    return isSettingsRoute(pathname) ? null : blockedAccountPath();
  }

  if (BLOCKED_STATUSES.has(account.status)) {
    return isSettingsRoute(pathname) ? null : blockedAccountPath();
  }

  return null;
}

export function resolvePostAuthRedirect(
  account: AccountForRedirect,
  next?: string | null,
): string {
  if (!account) {
    return safeRedirectPath(next, "/discover");
  }

  switch (account.status) {
    case "onboarding":
      return attestationPath();
    case "active":
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
