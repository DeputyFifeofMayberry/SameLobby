export const FREE_LIMITS = {
  maxActiveGames: 8,
  maxActiveGroupsOwned: 1,
  maxSavedSearches: 0,
} as const;

export const PLUS_LIMITS = {
  maxActiveGames: 25,
  maxActiveGroupsOwned: 10,
  maxSavedSearches: 10,
} as const;

export const PAST_DUE_GRACE_DAYS = 7;
