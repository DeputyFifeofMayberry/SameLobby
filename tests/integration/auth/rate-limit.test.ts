import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertTestGuards } from "../../support/guards";

describe("[SL-T004][integration] @p1 auth rate-limit keys", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-09T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("enforces sign-in style limits per email key", () => {
    assertTestGuards();
    const key = "sign-in:rate-limit@test.local";
    const limit = 10;
    const windowMs = 60_000;

    for (let i = 0; i < limit; i += 1) {
      expect(checkRateLimit(key, limit, windowMs).allowed).toBe(true);
    }

    const denied = checkRateLimit(key, limit, windowMs);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterMs).toBeGreaterThan(0);
  });

  it("allows sign-up attempts again after the auth window resets", () => {
    assertTestGuards();
    const key = "sign-up:reset@test.local";

    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit(key, 5, 2_000).allowed).toBe(true);
    }
    expect(checkRateLimit(key, 5, 2_000).allowed).toBe(false);

    vi.advanceTimersByTime(2_001);
    expect(checkRateLimit(key, 5, 2_000).allowed).toBe(true);
  });
});
