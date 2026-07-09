const SCRUB_PATTERNS = [
  /password/i,
  /token/i,
  /message/i,
  /email/i,
  /authorization/i,
];

export function scrubValue(key: string, value: unknown): unknown {
  if (SCRUB_PATTERNS.some((p) => p.test(key))) {
    return "[Redacted]";
  }
  return value;
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

  if (dsn) {
    void import("@sentry/nextjs").then((Sentry) => {
      Sentry.captureException(error, {
        extra: context
          ? Object.fromEntries(
              Object.entries(context).map(([k, v]) => [k, scrubValue(k, v)]),
            )
          : undefined,
      });
    });
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.error(
      JSON.stringify({
        type: "sentry_stub",
        error: error instanceof Error ? error.message : String(error),
        context: context
          ? Object.fromEntries(
              Object.entries(context).map(([k, v]) => [k, scrubValue(k, v)]),
            )
          : {},
      }),
    );
  }
}
