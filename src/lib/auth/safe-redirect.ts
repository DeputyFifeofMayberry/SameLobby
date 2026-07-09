const ALLOWED_PREFIXES = [
  "/discover",
  "/connections",
  "/messages",
  "/play",
  "/teammates",
  "/groups",
  "/onboarding",
  "/settings",
] as const;

/**
 * Returns a safe same-origin relative path or the fallback.
 * Rejects protocol-relative and absolute URLs.
 */
export function safeRedirectPath(
  next: string | null | undefined,
  fallback = "/discover",
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  const allowed = ALLOWED_PREFIXES.some(
    (prefix) => next === prefix || next.startsWith(`${prefix}/`),
  );

  return allowed ? next : fallback;
}
