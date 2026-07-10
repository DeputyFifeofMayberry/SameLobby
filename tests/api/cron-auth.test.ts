import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/jobs/deletion-pipeline", () => ({
  runDeletionPipeline: vi.fn().mockResolvedValue({ processed: 0 }),
}));

describe("[SL-T110][api] @p0 cron auth", () => {
  const originalSecret = process.env.CRON_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalSecret;
    }
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("allows requests when CRON_SECRET is unset in non-production", async () => {
    delete process.env.CRON_SECRET;
    vi.stubEnv("NODE_ENV", "test");
    vi.resetModules();
    const { GET } = await import("@/app/api/cron/deletion-pipeline/route");
    const response = await GET(
      new Request("http://localhost/api/cron/deletion-pipeline"),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.ok).toBe(true);
  });

  it("rejects requests when CRON_SECRET is unset in production (Q21)", async () => {
    delete process.env.CRON_SECRET;
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const { GET } = await import("@/app/api/cron/deletion-pipeline/route");
    const response = await GET(
      new Request("http://localhost/api/cron/deletion-pipeline"),
    );
    expect(response.status).toBe(503);
  });

  it("rejects requests without bearer token when CRON_SECRET is set", async () => {
    process.env.CRON_SECRET = "test-cron-secret";
    vi.resetModules();
    const { GET } = await import("@/app/api/cron/deletion-pipeline/route");
    const response = await GET(
      new Request("http://localhost/api/cron/deletion-pipeline"),
    );
    expect(response.status).toBe(401);
  });

  it("accepts authorized bearer token when CRON_SECRET is set", async () => {
    process.env.CRON_SECRET = "test-cron-secret";
    vi.resetModules();
    const { GET } = await import("@/app/api/cron/deletion-pipeline/route");
    const response = await GET(
      new Request("http://localhost/api/cron/deletion-pipeline", {
        headers: { authorization: "Bearer test-cron-secret" },
      }),
    );
    expect(response.status).toBe(200);
  });
});
