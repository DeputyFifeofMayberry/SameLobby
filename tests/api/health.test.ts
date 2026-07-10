import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mocks.from,
  })),
}));

import { GET } from "@/app/api/health/route";

describe("[SL-T112][api] @p1 health route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns healthy status when the database probe succeeds", async () => {
    mocks.from.mockReturnValue({
      select: () => ({
        limit: async () => ({ error: null }),
      }),
    });

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.app).toBe("ok");
    expect(body.database).toBe("ok");
    expect(body.timestamp).toBeTruthy();
  });

  it("returns degraded database status with HTTP 503 (Q20)", async () => {
    mocks.from.mockReturnValue({
      select: () => ({
        limit: async () => ({ error: { message: "timeout" } }),
      }),
    });

    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.database).toBe("degraded");
  });

  it("returns unavailable with HTTP 503 when the probe throws", async () => {
    mocks.from.mockImplementation(() => {
      throw new Error("connection refused");
    });

    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.database).toBe("unavailable");
  });
});
