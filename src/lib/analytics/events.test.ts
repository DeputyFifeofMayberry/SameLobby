import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_EVENTS,
  trackEvent,
  type AnalyticsEvent,
} from "@/lib/analytics/events";

describe("[SL-T115][unit] @p0 analytics allowlist", () => {
  let consoleLog: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    consoleLog.mockRestore();
  });

  it("exposes the approved event allowlist", () => {
    expect(ANALYTICS_EVENTS).toContain("sign_in_completed");
    expect(ANALYTICS_EVENTS).toContain("account_created");
    expect(ANALYTICS_EVENTS.length).toBeGreaterThan(10);
  });

  it("rejects unknown analytics events", () => {
    expect(() =>
      trackEvent("not_a_real_event" as AnalyticsEvent),
    ).toThrow(/not allowlisted/);
  });

  it("accepts allowlisted events with safe properties", () => {
    trackEvent("sign_in_completed", { source: "password" });
    expect(consoleLog).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(consoleLog.mock.calls[0]?.[0]));
    expect(payload.type).toBe("analytics_event");
    expect(payload.event).toBe("sign_in_completed");
    expect(payload.properties).toEqual({ source: "password" });
  });

  it("documents D10: property values are not scrubbed yet", () => {
    trackEvent("sign_up_started", { email: "user@test.local" });
    const payload = JSON.parse(String(consoleLog.mock.calls[0]?.[0]));
    expect(payload.properties.email).toBe("user@test.local");
  });

  it("documents replay-off intent in analytics init options", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/lib/analytics/events.ts", "utf8"),
    );
    expect(source).toContain("disable_session_recording: true");
  });
});
