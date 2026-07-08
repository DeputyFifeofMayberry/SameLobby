export const COMMUNICATION_MODES = [
  "same_lobby_text",
  "in_game_text",
  "voice_chat",
  "discord",
] as const;

export type CommunicationMode = (typeof COMMUNICATION_MODES)[number];

export const ONBOARDING_STEPS = [
  "identity",
  "games",
  "communication",
  "goal",
  "availability",
  "preview",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const INTENT_GOALS = [
  "gaming_friendship",
  "specific_game_duo",
  "teammates",
  "casual_sessions",
  "cross_platform_play",
] as const;

export type IntentGoal = (typeof INTENT_GOALS)[number];

export const VISIBILITY_LEVELS = [
  "public",
  "match_only",
  "connection_only",
  "private",
] as const;

export type VisibilityLevel = (typeof VISIBILITY_LEVELS)[number];

export type GamerProfile = {
  id: string;
  account_id: string;
  display_name: string | null;
  communication_modes: CommunicationMode[];
  introduction: string | null;
  onboarding_step: OnboardingStep;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DisclosureSetting = {
  id: string;
  account_id: string;
  field_key: string;
  visibility: VisibilityLevel;
};

export type CurrentIntent = {
  id: string;
  account_id: string;
  goal: IntentGoal;
  status: "active" | "paused" | "expired";
  expires_at: string;
};

export type AvailabilityWindow = {
  id: string;
  account_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export const COMMUNICATION_MODE_LABELS: Record<CommunicationMode, string> = {
  same_lobby_text: "SameLobby text",
  in_game_text: "In-game text",
  voice_chat: "Voice chat",
  discord: "Discord",
};

export const INTENT_GOAL_LABELS: Record<IntentGoal, string> = {
  gaming_friendship: "Gaming friendship",
  specific_game_duo: "Regular duo for a specific game",
  teammates: "Teammates for ranked or serious play",
  casual_sessions: "Casual sessions when schedules align",
  cross_platform_play: "Cross-platform gaming friends",
};

export const VISIBILITY_LABELS: Record<VisibilityLevel, string> = {
  public: "Public",
  match_only: "Match-only",
  connection_only: "Connection-only",
  private: "Private",
};
