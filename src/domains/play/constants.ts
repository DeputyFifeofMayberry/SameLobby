export const PLAY_INVITATION_TTL_DAYS = 14;
export const MAX_PLAY_NOTE_LENGTH = 300;
export const MAX_TIME_SLOTS = 3;
export const SESSION_LENGTH_OPTIONS = [60, 90, 120] as const;

export const SESSION_LENGTH_LABELS: Record<
  (typeof SESSION_LENGTH_OPTIONS)[number],
  string
> = {
  60: "~60 minutes",
  90: "~90 minutes",
  120: "~120 minutes",
};
