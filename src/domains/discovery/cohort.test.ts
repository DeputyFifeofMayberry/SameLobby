import { describe, expect, it } from "vitest";
import { COHORT_MIN_QUALIFIED } from "@/domains/discovery/constants";
import {
  buildCohortKey,
  cohortStatusFromCount,
  pickAnchorGameSlug,
  timeZoneRegion,
} from "@/domains/discovery/cohort";

describe("[SL-T029][unit] @p1 discovery cohort", () => {
  it("maps time zones to broad regions", () => {
    expect(timeZoneRegion("America/Los_Angeles")).toBe("America");
    expect(timeZoneRegion("Europe/London")).toBe("Europe");
    expect(timeZoneRegion("UTC")).toBe("UTC");
  });

  it("builds deterministic cohort keys from locale, region, and anchor slug", () => {
    expect(buildCohortKey("en", "America/Los_Angeles", "fortnite")).toBe(
      "en:America:fortnite",
    );
    expect(buildCohortKey("fr", "Europe/Paris", "rocket-league")).toBe(
      "fr:Europe:rocket-league",
    );
  });

  it("returns below_threshold at 39 qualified accounts without demand signal", () => {
    expect(cohortStatusFromCount(39, false)).toBe("below_threshold");
  });

  it("returns demand_collecting at 39 with demand signal", () => {
    expect(cohortStatusFromCount(39, true)).toBe("demand_collecting");
  });

  it("activates discovery at the 40-account threshold", () => {
    expect(COHORT_MIN_QUALIFIED).toBe(40);
    expect(cohortStatusFromCount(40, false)).toBe("active_discovery");
    expect(cohortStatusFromCount(41, false)).toBe("active_discovery");
  });

  it("picks the anchor game slug when present", () => {
    expect(
      pickAnchorGameSlug([
        { gameSlug: "fortnite", isAnchor: false },
        { gameSlug: "apex-legends", isAnchor: true },
      ]),
    ).toBe("apex-legends");
  });

  it("falls back to the first game or unknown", () => {
    expect(
      pickAnchorGameSlug([{ gameSlug: "fortnite", isAnchor: false }]),
    ).toBe("fortnite");
    expect(pickAnchorGameSlug([])).toBe("unknown");
  });
});
