export type TeammateStatus =
  | "proposed"
  | "teammate"
  | "regular_teammate"
  | "ended";

export type TeammateRelationship = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  connection_id: string;
  status: TeammateStatus;
  proposed_by_account_id: string | null;
  user_a_affirmed: boolean;
  user_b_affirmed: boolean;
  regular_teammate_at: string | null;
  created_at: string;
  updated_at: string;
  status_changed_at: string;
};

export type TeammateListItem = {
  id: string;
  otherAccountId: string;
  otherDisplayName: string;
  status: TeammateStatus;
  direction: "incoming" | "outgoing" | "mutual";
  sharedGameLabels: string[];
  isRegular: boolean;
};

export type TeammateDetail = TeammateRelationship & {
  otherAccountId: string;
  otherDisplayName: string;
  viewerIsUserA: boolean;
  viewerAffirmed: boolean;
  otherAffirmed: boolean;
  noteBody: string | null;
  conversationId: string | null;
};
