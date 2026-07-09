export type PrivateGroupStatus = "forming" | "active" | "closed";
export type GroupMemberRole = "owner" | "admin" | "member";
export type GroupMembershipStatus =
  | "pending_approval"
  | "active"
  | "left"
  | "removed";
export type GroupInvitationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled";

export type GroupListItem = {
  id: string;
  name: string;
  status: PrivateGroupStatus;
  memberCount: number;
  sizeGoal: number;
  emblemKey: string | null;
  gameName: string | null;
};

export type GroupMemberView = {
  accountId: string;
  displayName: string;
  role: GroupMemberRole;
  status: GroupMembershipStatus;
};

export type GroupInvitationListItem = {
  id: string;
  groupId: string;
  groupName: string;
  inviterDisplayName: string;
  expiresAt: string;
};

export type PendingMemberApproval = {
  invitationId: string;
  inviteeAccountId: string;
  inviteeDisplayName: string;
  viewerVote: boolean | null;
};

export type GroupDetail = {
  id: string;
  name: string;
  status: PrivateGroupStatus;
  sizeGoal: number;
  emblemKey: string | null;
  gameName: string | null;
  ownerAccountId: string;
  viewerRole: GroupMemberRole | null;
  members: GroupMemberView[];
  conversationId: string | null;
  pendingInvitations: {
    id: string;
    inviteeDisplayName: string;
    status: GroupInvitationStatus;
  }[];
  pendingApprovals: PendingMemberApproval[];
};
