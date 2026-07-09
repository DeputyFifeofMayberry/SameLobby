export type PlayInvitationStatus =
  | "proposed"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled"
  | "countered";

export type PlaySchedulingMode = "play_now" | "scheduled";

export type GamingSessionStatus =
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type PostPlayOccurred = "yes" | "no" | "skip";

export type PostPlayContinuation =
  | "keep_chatting"
  | "play_again"
  | "add_teammate"
  | "add_to_group"
  | "not_now";

export type PlayInvitation = {
  id: string;
  conversation_id: string;
  proposer_account_id: string;
  recipient_account_id: string;
  game_id: string;
  platform_id: string;
  status: PlayInvitationStatus;
  scheduling_mode: PlaySchedulingMode;
  session_length_minutes: number;
  voice_preferred: boolean;
  note: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
};

export type PlayTimeOption = {
  id: string;
  invitation_id: string;
  proposed_start_at: string;
  sort_order: number;
};

export type GamingSession = {
  id: string;
  invitation_id: string;
  conversation_id: string;
  game_id: string;
  platform_id: string;
  status: GamingSessionStatus;
  confirmed_start_at: string;
  session_length_minutes: number;
  started_at: string | null;
  completed_at: string | null;
  participant_a_id: string;
  participant_b_id: string;
  occurred_a: boolean | null;
  occurred_b: boolean | null;
  reminder_24h_sent_at: string | null;
  reminder_30m_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SharedGameOption = {
  gameId: string;
  gameName: string;
  platformId: string;
  platformName: string;
};

export type PlayInvitationListItem = {
  id: string;
  direction: "incoming" | "outgoing";
  status: PlayInvitationStatus;
  otherAccountId: string;
  otherDisplayName: string;
  gameName: string;
  platformName: string;
  schedulingMode: PlaySchedulingMode;
  expiresAt: string;
  createdAt: string;
};

export type PlayInvitationDetail = PlayInvitation & {
  timeOptions: PlayTimeOption[];
  gameName: string;
  platformName: string;
  proposerDisplayName: string;
  recipientDisplayName: string;
  viewerIsRecipient: boolean;
  sessionId: string | null;
};

export type GamingSessionListItem = {
  id: string;
  otherAccountId: string;
  otherDisplayName: string;
  gameName: string;
  platformName: string;
  status: GamingSessionStatus;
  confirmedStartAt: string;
  sessionLengthMinutes: number;
  viewerTimeZone: string;
  otherTimeZone: string;
};

export type GamingSessionDetail = GamingSession & {
  gameName: string;
  platformName: string;
  otherAccountId: string;
  otherDisplayName: string;
  viewerTimeZone: string;
  otherTimeZone: string;
  viewerIsParticipantA: boolean;
  viewerOccurred: boolean | null;
  otherOccurred: boolean | null;
  feedbackSubmitted: boolean;
};

export const POST_PLAY_CONTINUATION_LABELS: Record<
  PostPlayContinuation,
  string
> = {
  keep_chatting: "Keep chatting",
  play_again: "Play again soon",
  add_teammate: "Add as teammate",
  add_to_group: "Add to a group",
  not_now: "Not right now",
};

export const GAMING_SESSION_STATUS_LABELS: Record<GamingSessionStatus, string> =
  {
    confirmed: "Confirmed",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
    disputed: "Disputed",
  };
