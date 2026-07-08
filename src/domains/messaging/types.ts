import type { IntentGoal } from "@/domains/profile/types";

export type ConversationPermission =
  | "open"
  | "archived"
  | "restricted"
  | "blocked"
  | "closed";

export type ConversationKind = "direct";

export type Conversation = {
  id: string;
  connection_id: string;
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
  otherAccountId: string;
  otherDisplayName: string;
  sharedGameLabel: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unread: boolean;
};

export type ConversationThread = {
  conversation: Conversation;
  otherAccountId: string;
  otherDisplayName: string;
  sharedGameLabels: string[];
  goalLabel: string | null;
  goal: IntentGoal | null;
  messages: Message[];
  viewerAccountId: string;
};
