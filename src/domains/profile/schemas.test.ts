import { describe, expect, it } from "vitest";
import { FREE_LIMITS } from "@/domains/billing/constants";
import {
  displayNameSchema,
  communicationStepSchema,
  MAX_ACTIVE_USER_GAMES,
} from "@/domains/profile/schemas";
import type { CommunicationMode } from "@/domains/profile/types";
import {
  isProfileComplete,
  profileCompletenessErrors,
} from "@/domains/profile/completeness";

describe("displayNameSchema", () => {
  it("accepts valid names", () => {
    expect(displayNameSchema.safeParse("NightOwl_42").success).toBe(true);
  });

  it("rejects too short names", () => {
    expect(displayNameSchema.safeParse("ab").success).toBe(false);
  });
});

describe("communicationStepSchema", () => {
  it("requires at least one mode", () => {
    expect(communicationStepSchema.safeParse({ modes: [] }).success).toBe(
      false,
    );
    expect(
      communicationStepSchema.safeParse({ modes: ["voice_chat"] }).success,
    ).toBe(true);
  });
});

describe("profile completeness", () => {
  const base = {
    account: { time_zone: "America/Los_Angeles" },
    profile: {
      display_name: "PlayerOne",
      communication_modes: ["voice_chat"] as CommunicationMode[],
      onboarding_completed_at: null,
    },
    userGames: [{ id: "g1" }],
    currentIntent: { goal: "gaming_friendship" as const },
  };

  it("detects complete profiles", () => {
    expect(isProfileComplete(base)).toBe(true);
  });

  it("lists missing requirements", () => {
    const errors = profileCompletenessErrors({
      ...base,
      userGames: [],
    });
    expect(errors).toContain("Add at least one game and platform.");
  });
});

describe("MAX_ACTIVE_USER_GAMES", () => {
  it("re-exports free tier limit", () => {
    expect(MAX_ACTIVE_USER_GAMES).toBe(FREE_LIMITS.maxActiveGames);
  });
});
