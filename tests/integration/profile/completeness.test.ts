import { describe, expect, it } from "vitest";
import {
  isProfileComplete,
  profileCompletenessErrors,
} from "@/domains/profile/completeness";

describe("[SL-T022][integration] @p0 profile completeness", () => {
  it("requires display name, time zone, game, communication, and goal", () => {
    const incomplete = {
      account: { time_zone: null },
      profile: {
        display_name: null,
        communication_modes: [],
        onboarding_completed_at: null,
      },
      userGames: [],
      currentIntent: null,
    };

    expect(isProfileComplete(incomplete)).toBe(false);
    const errors = profileCompletenessErrors(incomplete);
    expect(errors).toContain("Display name is required.");
    expect(errors).toContain("Time zone is required.");
    expect(errors).toContain("Add at least one game and platform.");
    expect(errors).toContain("Choose at least one communication mode.");
    expect(errors).toContain("Select a current goal.");
  });

  it("treats onboarding_completed_at as sufficient for completeness", () => {
    expect(
      isProfileComplete({
        account: { time_zone: null },
        profile: {
          display_name: null,
          communication_modes: [],
          onboarding_completed_at: "2026-01-01T00:00:00Z",
        },
        userGames: [],
        currentIntent: null,
      }),
    ).toBe(true);
  });

  it("passes when all minimum fields are present", () => {
    expect(
      isProfileComplete({
        account: { time_zone: "America/Los_Angeles" },
        profile: {
          display_name: "PlayerOne",
          communication_modes: ["same_lobby_text"],
          onboarding_completed_at: null,
        },
        userGames: [{ id: "ug-1" }],
        currentIntent: { goal: "gaming_friendship" },
      }),
    ).toBe(true);
    expect(
      profileCompletenessErrors({
        account: { time_zone: "America/Los_Angeles" },
        profile: {
          display_name: "PlayerOne",
          communication_modes: ["same_lobby_text"],
          onboarding_completed_at: null,
        },
        userGames: [{ id: "ug-1" }],
        currentIntent: { goal: "gaming_friendship" },
      }),
    ).toHaveLength(0);
  });
});
