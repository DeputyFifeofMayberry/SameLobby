/**
 * Allowlisted analytics events — no message bodies, preferences, or PII.
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
  "connection_request_sent",
  "connection_request_accepted",
  "block_created",
  "message_sent",
  "report_submitted",
  "play_invitation_sent",
  "play_invitation_accepted",
  "teammate_added",
  "group_created",
  "subscription_checkout_started",
  "subscription_active",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

const allowlist = new Set<string>(ANALYTICS_EVENTS);

export type SafeEventProperties = Record<
  string,
  string | number | boolean | null
>;

type PostHogClient = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  init: (
    key: string,
    options?: {
      api_host?: string;
      disable_session_recording?: boolean;
    },
  ) => void;
};

let posthogClient: PostHogClient | null = null;
let posthogInitAttempted = false;

async function getPostHogClient(): Promise<PostHogClient | null> {
  if (typeof window === "undefined") return null;
  if (posthogClient) return posthogClient;
  if (posthogInitAttempted) return null;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  posthogInitAttempted = true;
  try {
    const mod = await import("posthog-js");
    const client = mod.default as PostHogClient;
    client.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      // Keep replay off globally so client-side navigation can never begin recording
      // sensitive messaging or admin screens.
      disable_session_recording: true,
    });
    posthogClient = client;
    return client;
  } catch {
    return null;
  }
}

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

  if (typeof window !== "undefined") {
    void getPostHogClient().then((client) => {
      client?.capture(event, properties ?? {});
    });
  }
}

export async function initClientAnalytics(): Promise<void> {
  await getPostHogClient();
}
