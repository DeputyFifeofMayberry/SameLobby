import { describe, expect, it } from "vitest";
import {
  buildReasonCodes,
  canPlayOnSharedGame,
  checkEligibility,
  isBlocked,
} from "@/domains/discovery/eligibility";
import type { DiscoveryCandidate } from "@/domains/discovery/types";

function candidate(
  id: string,
  overrides: Partial<DiscoveryCandidate> = {},
): DiscoveryCandidate {
  return {
    accountId: id,
    locale: "en",
    timeZone: "America/Los_Angeles",
    displayName: `Player ${id}`,
    communicationModes: ["same_lobby_text"],
    introduction: null,
    goal: "gaming_friendship",
    intentGameId: null,
    intentPlatformId: null,
    userGames: [
      {
        gameId: "game-1",
        platformId: "platform-pc",
        gameName: "Fortnite",
        platformName: "PC",
      },
    ],
    availability: [],
    ...overrides,
  };
}

describe("[SL-T028][unit] @p0 eligibility", () => {
  describe("checkEligibility", () => {
  it("rejects self", () => {
    const viewer = candidate("a");
    const result = checkEligibility({
      viewer,
      target: viewer,
      blockedPairs: new Set(),
      crossplayByGame: new Map(),
    });
    expect(result).toEqual({ eligible: false, reason: "self" });
  });

  it("rejects blocked pairs in either direction", () => {
    const blocked = new Set(["a:b"]);
    expect(isBlocked("a", "b", blocked)).toBe(true);
    expect(isBlocked("b", "a", new Set(["b:a"]))).toBe(true);
  });

  it("never relaxes block exclusion", () => {
    const viewer = candidate("a");
    const target = candidate("b");
    const result = checkEligibility({
      viewer,
      target,
      blockedPairs: new Set(["a:b"]),
      crossplayByGame: new Map(),
    });
    expect(result).toEqual({ eligible: false, reason: "blocked" });
  });

  it("requires shared playable game and matching goal", () => {
    const viewer = candidate("a");
    const target = candidate("b", {
      userGames: [
        {
          gameId: "game-2",
          platformId: "platform-pc",
          gameName: "Other",
          platformName: "PC",
        },
      ],
    });
    const result = checkEligibility({
      viewer,
      target,
      blockedPairs: new Set(),
      crossplayByGame: new Map(),
    });
    expect(result).toEqual({ eligible: false, reason: "no_shared_game" });
  });

  it("accepts eligible pair with same platform", () => {
    const viewer = candidate("a");
    const target = candidate("b");
    const result = checkEligibility({
      viewer,
      target,
      blockedPairs: new Set(),
      crossplayByGame: new Map([["game-1", [new Set(["platform-pc", "platform-ps"])]]]),
    });
    expect(result).toEqual({ eligible: true });
  });
});

describe("canPlayOnSharedGame", () => {
  it("allows cross-play when platforms share a crossplay set", () => {
    const viewer = candidate("a", {
      userGames: [
        {
          gameId: "game-1",
          platformId: "platform-pc",
          gameName: "Fortnite",
          platformName: "PC",
        },
      ],
    });
    const target = candidate("b", {
      userGames: [
        {
          gameId: "game-1",
          platformId: "platform-ps",
          gameName: "Fortnite",
          platformName: "PlayStation",
        },
      ],
    });
    const crossplay = new Map([["game-1", [new Set(["platform-pc", "platform-ps"])]]]);
    expect(canPlayOnSharedGame(viewer, target, "game-1", crossplay)).toBe(true);
  });
});

describe("buildReasonCodes", () => {
  it("is reproducible for the same inputs", () => {
    const viewer = candidate("a", {
      availability: [{ dayOfWeek: 1, startTime: "18:00", endTime: "21:00" }],
    });
    const target = candidate("b", {
      availability: [{ dayOfWeek: 1, startTime: "19:00", endTime: "22:00" }],
      timeZone: "America/Denver",
    });
    const crossplay = new Map([["game-1", [new Set(["platform-pc"])]]]);
    const first = buildReasonCodes({ viewer, target, crossplayByGame: crossplay });
    const second = buildReasonCodes({ viewer, target, crossplayByGame: crossplay });
    expect(first).toEqual(second);
    expect(first).toContain("shared_game");
    expect(first).toContain("shared_goal");
  });
});
});
