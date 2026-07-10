import { afterEach, describe, expect, it, vi } from "vitest";

describe("env validation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("accepts placeholder values when SKIP_ENV_VALIDATION is set", async () => {
    vi.stubEnv("SKIP_ENV_VALIDATION", "true");
    vi.stubEnv("NODE_ENV", "test");

    const { env } = await import("@/lib/env");
    expect(env.SKIP_ENV_VALIDATION).toBe(true);
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toMatch(/^https?:\/\//);
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeTruthy();
  });

  it("requires service role key without skip flag", async () => {
    vi.stubEnv("SKIP_ENV_VALIDATION", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    await expect(import("@/lib/env")).rejects.toThrow(
      "Invalid environment variables",
    );
  });

  it("requires CRON_SECRET in production without skip flag", async () => {
    vi.stubEnv("SKIP_ENV_VALIDATION", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
    delete process.env.CRON_SECRET;

    await expect(import("@/lib/env")).rejects.toThrow(
      "Invalid environment variables",
    );
  });
});
