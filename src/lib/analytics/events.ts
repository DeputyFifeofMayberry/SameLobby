/**
 * Allowlisted analytics events — no message bodies, preferences, or PII.
 * PostHog integration deferred; registry enforced at call sites.
 */

export const ANALYTICS_EVENTS = [
  "account_created",
  "adult_attestation_completed",
  "onboarding_step_completed",
  "onboarding_completed",
  "account_deletion_requested",
  "sign_up_started",
  "sign_up_completed",
  "sign_in_completed",
  "password_reset_requested",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

const allowlist = new Set<string>(ANALYTICS_EVENTS);

export type SafeEventProperties = Record<
  string,
  string | number | boolean | null
>;

export function trackEvent(
  event: AnalyticsEvent,
  properties?: SafeEventProperties,
): void {
  if (!allowlist.has(event)) {
    throw new Error(`Analytics event not allowlisted: ${event}`);
  }
  if (process.env.NODE_ENV === "development") {
    console.log(
      JSON.stringify({
        type: "analytics_event",
        event,
        properties: properties ?? {},
      }),
    );
  }
  // PostHog capture wired in a later slice when provider is configured
}
