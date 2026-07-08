import type { CommunicationMode, IntentGoal } from "@/domains/profile/types";

export type CohortStatus =
  | "below_threshold"
  | "demand_collecting"
  | "qualified"
  | "active_discovery";

export type DiscoveryRecommendation = {
  id: string;
  viewer_account_id: string;
  recommended_account_id: string;
  reason_codes: string[];
  expires_at: string;
  created_at: string;
};

export type DiscoveryCandidate = {
  accountId: string;
  locale: string;
  timeZone: string;
  displayName: string;
  communicationModes: CommunicationMode[];
  introduction: string | null;
  goal: IntentGoal;
  intentGameId: string | null;
  intentPlatformId: string | null;
  userGames: { gameId: string; platformId: string; gameName: string; platformName: string }[];
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
};

export type RecommendationCard = {
  recommendationId: string;
  accountId: string;
  displayName: string;
  reasonLabels: string[];
  sharedGameLabel: string | null;
  goal: IntentGoal;
};

export type CohortSnapshot = {
  cohortKey: string;
  status: CohortStatus;
  qualifiedCount: number;
  hasDemandSignal: boolean;
};
