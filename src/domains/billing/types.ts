import type { FREE_LIMITS, PLUS_LIMITS } from "@/domains/billing/constants";

export type SubscriptionTier = "free" | "plus";

export type SubscriptionStatus =
  "none" | "active" | "past_due" | "cancel_at_period_end" | "canceled";

export type Entitlements = {
  accountId: string;
  tier: SubscriptionTier;
  maxActiveGames: number;
  maxActiveGroupsOwned: number;
  maxSavedSearches: number;
  readOnly: boolean;
};

export type SubscriptionRow = {
  account_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  plan_key: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  past_due_since: string | null;
};

export type SavedSearchFilters = {
  q?: string;
  gameId?: string;
  platformId?: string;
  goal?: string;
};

export type SavedSearch = {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  createdAt: string;
};

export type PlanLimits = typeof FREE_LIMITS | typeof PLUS_LIMITS;
