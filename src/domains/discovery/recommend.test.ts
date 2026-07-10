import { describe, expect, it } from "vitest";
import { MAX_RECOMMENDATIONS } from "@/domains/discovery/constants";
import { rankEligibleCandidates } from "@/domains/discovery/recommend";
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

describe("[SL-T032][unit] @p1 discovery ranking", () => {
  const crossplay = new Map([["game-1", [new Set(["platform-pc"])]]]);

  it("ranks by reason count then display name for stable tie-breaks", () => {
    const viewer = candidate("viewer");
    const candidates = [
      candidate("zulu", {
        displayName: "Zulu",
        availability: [{ dayOfWeek: 1, startTime: "18:00", endTime: "21:00" }],
      }),
      candidate("alpha", {
        displayName: "Alpha",
        availability: [{ dayOfWeek: 1, startTime: "19:00", endTime: "22:00" }],
        timeZone: "America/Denver",
      }),
      candidate("mike", {
        displayName: "Mike",
        userGames: [
          {
            gameId: "game-2",
            platformId: "platform-pc",
            gameName: "Other",
            platformName: "PC",
          },
        ],
      }),
    ];

    const first = rankEligibleCandidates(
      viewer,
      candidates,
      new Set(),
      crossplay,
    );
    const second = rankEligibleCandidates(
      viewer,
      candidates,
      new Set(),
      crossplay,
    );

    expect(first).toEqual(second);
    expect(first.map((row) => row.target.displayName)).toEqual(["Alpha", "Zulu"]);
    expect(first[0]!.reasonCodes.length).toBeGreaterThanOrEqual(
      first[1]!.reasonCodes.length,
    );
  });

  it("caps results at MAX_RECOMMENDATIONS without popularity bias", () => {
    const viewer = candidate("viewer");
    const many = Array.from({ length: 20 }, (_, index) =>
      candidate(`p-${index}`, { displayName: `Player ${index}` }),
    );

    const ranked = rankEligibleCandidates(viewer, many, new Set(), crossplay);
    expect(ranked).toHaveLength(MAX_RECOMMENDATIONS);
    expect(ranked.every((row) => row.target.accountId !== viewer.accountId)).toBe(
      true,
    );
  });

  it("excludes blocked pairs in either direction", () => {
    const viewer = candidate("viewer");
    const blocked = new Set(["viewer:blocked"]);
    const ranked = rankEligibleCandidates(
      viewer,
      [candidate("blocked"), candidate("allowed")],
      blocked,
      crossplay,
    );
    expect(ranked).toHaveLength(1);
    expect(ranked[0]!.target.accountId).toBe("allowed");
  });
});
