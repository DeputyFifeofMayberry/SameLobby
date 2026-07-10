import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("[SL-T004][unit] @p1 in-memory rate limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-09T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit within a window", () => {
    const key = "unit-allow";
    expect(checkRateLimit(key, 3, 60_000)).toEqual({ allowed: true });
    expect(checkRateLimit(key, 3, 60_000)).toEqual({ allowed: true });
    expect(checkRateLimit(key, 3, 60_000)).toEqual({ allowed: true });
  });

  it("denies requests at the limit and exposes retryAfterMs", () => {
    const key = "unit-deny";
    for (let i = 0; i < 3; i += 1) {
      expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
    }

    const denied = checkRateLimit(key, 3, 60_000);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterMs).toBeGreaterThan(0);
    expect(denied.retryAfterMs).toBeLessThanOrEqual(60_000);
  });

  it("resets the counter after the window elapses", () => {
    const key = "unit-reset";
    for (let i = 0; i < 2; i += 1) {
      expect(checkRateLimit(key, 2, 1_000).allowed).toBe(true);
    }
    expect(checkRateLimit(key, 2, 1_000).allowed).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(checkRateLimit(key, 2, 1_000)).toEqual({ allowed: true });
  });

  it("isolates counters per key", () => {
    expect(checkRateLimit("key-a", 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit("key-a", 1, 60_000).allowed).toBe(false);
    expect(checkRateLimit("key-b", 1, 60_000).allowed).toBe(true);
  });
});
