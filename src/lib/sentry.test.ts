import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureException, scrubValue } from "@/lib/sentry";

describe("[SL-T114][unit] @p0 Sentry scrub", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.SENTRY_DSN;
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    consoleError.mockRestore();
  });

  it("redacts sensitive top-level keys", () => {
    expect(scrubValue("password", "secret")).toBe("[Redacted]");
    expect(scrubValue("accessToken", "abc")).toBe("[Redacted]");
    expect(scrubValue("userEmail", "a@b.c")).toBe("[Redacted]");
    expect(scrubValue("safeId", "user-1")).toBe("user-1");
  });

  it("documents D9: nested sensitive values are not scrubbed by key-only helper", () => {
    const nested = { password: "nested-secret", safe: "ok" };
    expect(scrubValue("context", nested)).toEqual(nested);
  });

  it("scrubs context keys when captureException logs in development", () => {
    captureException(new Error("boom"), {
      password: "secret",
      accountId: "acct-1",
      nested: { email: "user@test.local" },
    });

    expect(consoleError).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(consoleError.mock.calls[0]?.[0]));
    expect(payload.type).toBe("sentry_stub");
    expect(payload.context.password).toBe("[Redacted]");
    expect(payload.context.accountId).toBe("acct-1");
    // D9: nested email survives because scrub is shallow
    expect(payload.context.nested).toEqual({ email: "user@test.local" });
  });
});
