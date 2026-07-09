import type { IntentGoal } from "@/domains/profile/types";

export type ConversationPermission =
  | "open"
  | "archived"
  | "restricted"
  | "blocked"
  | "closed";

export type ConversationKind = "direct" | "group";

export type Conversation = {
  id: string;
  connection_id: string | null;
  group_id: string | null;
  kind: ConversationKind;
  permission: ConversationPermission;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_account_id: string;
  body: string;
  retention_at: string;
  created_at: string;
};

export type ConversationListItem = {
  conversationId: string;
  kind: ConversationKind;
  otherAccountId: string | null;
  otherDisplayName: string;
  sharedGameLabel: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unread: boolean;
};

export type ConversationThread = {
  conversation: Conversation;
  kind: ConversationKind;
  otherAccountId: string | null;
  otherDisplayName: string;
  groupId: string | null;
  groupName: string | null;
  senderDisplayNames: Record<string, string>;
  sharedGameLabels: string[];
  goalLabel: string | null;
  goal: IntentGoal | null;
  messages: Message[];
  viewerAccountId: string;
};
