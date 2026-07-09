import type { ConversationPermission } from "@/domains/messaging/types";

export function canProposePlay(input: {
  isConversationMember: boolean;
  connectionConnected: boolean;
  permission: ConversationPermission;
  isBlocked: boolean;
}): boolean {
  return (
    input.isConversationMember &&
    input.connectionConnected &&
    input.permission === "open" &&
    !input.isBlocked
  );
}
