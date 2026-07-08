import { COHORT_MIN_QUALIFIED } from "@/domains/discovery/constants";
import type { CohortStatus } from "@/domains/discovery/types";

export function timeZoneRegion(timeZone: string): string {
  const parts = timeZone.split("/");
  return parts[0] ?? "unknown";
}

/** Cohort key: locale + broad time zone region + anchor game slug. */
export function buildCohortKey(
  locale: string,
  timeZone: string,
  anchorGameSlug: string,
): string {
  return `${locale}:${timeZoneRegion(timeZone)}:${anchorGameSlug}`;
}

export function cohortStatusFromCount(
  qualifiedCount: number,
  hasDemandSignal: boolean,
): CohortStatus {
  if (qualifiedCount < COHORT_MIN_QUALIFIED) {
    return hasDemandSignal ? "demand_collecting" : "below_threshold";
  }
  if (qualifiedCount >= COHORT_MIN_QUALIFIED) {
    return "active_discovery";
  }
  return "below_threshold";
}

export function pickAnchorGameSlug(
  userGames: { gameSlug: string; isAnchor: boolean }[],
): string {
  const anchor = userGames.find((g) => g.isAnchor);
  if (anchor) return anchor.gameSlug;
  return userGames[0]?.gameSlug ?? "unknown";
}
