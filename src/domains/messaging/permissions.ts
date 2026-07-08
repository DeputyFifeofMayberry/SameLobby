import type { ConversationPermission } from "@/domains/messaging/types";

export function canSendMessages(permission: ConversationPermission): boolean {
  return permission === "open";
}

export function permissionAfterBlock(): ConversationPermission {
  return "blocked";
}
