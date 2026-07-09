import { describe, expect, it } from "vitest";
import { FREE_LIMITS, PLUS_LIMITS } from "@/domains/billing/constants";

describe("billing limits", () => {
  it("matches prototype free tier", () => {
    expect(FREE_LIMITS).toEqual({
      maxActiveGames: 8,
      maxActiveGroupsOwned: 1,
      maxSavedSearches: 0,
    });
  });

  it("matches prototype plus tier", () => {
    expect(PLUS_LIMITS).toEqual({
      maxActiveGames: 25,
      maxActiveGroupsOwned: 10,
      maxSavedSearches: 10,
    });
  });
});
