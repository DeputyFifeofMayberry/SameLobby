import { describe, expect, it } from "vitest";
import { containsLink, messageBodySchema } from "@/domains/messaging/schemas";
import { messageRateLimitError } from "@/domains/messaging/rate-limits";
import { MESSAGE_RATE_LIMIT_COUNT } from "@/domains/messaging/constants";
import { buildIcebreakers } from "@/domains/messaging/icebreakers";

describe("messageBodySchema", () => {
  it("rejects empty messages", () => {
    expect(messageBodySchema.safeParse("   ").success).toBe(false);
  });

  it("accepts plain text", () => {
    expect(messageBodySchema.safeParse("Hello there").success).toBe(true);
  });
});

describe("containsLink", () => {
  it("detects http links", () => {
    expect(containsLink("see https://example.com")).toBe(true);
  });

  it("allows plain text", () => {
    expect(containsLink("fortnite tonight?")).toBe(false);
  });
});

describe("messageRateLimitError", () => {
  it("blocks at cap", () => {
    expect(
      messageRateLimitError({ messagesSentInWindow: MESSAGE_RATE_LIMIT_COUNT }),
    ).toContain("too quickly");
  });
});

describe("buildIcebreakers", () => {
  it("returns three reproducible suggestions", () => {
    const input = {
      sharedGames: [{ gameName: "Fortnite", platformName: "PC" }],
      goal: "gaming_friendship" as const,
    };
    const first = buildIcebreakers(input);
    const second = buildIcebreakers(input);
    expect(first).toEqual(second);
    expect(first).toHaveLength(3);
  });
});
