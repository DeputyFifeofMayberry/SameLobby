/** Minimum qualified accounts in a cohort before discovery activates. */
export const COHORT_MIN_QUALIFIED = 40;

/** Maximum recommendation cards shown per viewer per refresh cycle. */
export const MAX_RECOMMENDATIONS = 12;

/** Recommendation snapshot TTL (hours). */
export const RECOMMENDATION_TTL_HOURS = 24;

export const REASON_CODE_LABELS: Record<string, string> = {
  shared_game: "Shared game",
  playable_together: "Playable together",
  shared_goal: "Similar current goal",
  overlapping_availability: "Overlapping availability",
  shared_communication: "Compatible communication",
  time_zone_region: "Similar time zone region",
};
