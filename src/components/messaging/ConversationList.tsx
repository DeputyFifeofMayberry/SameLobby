import Link from "next/link";
import type { ConversationListItem as ConversationListItemType } from "@/domains/messaging/types";
import { ConversationListItem } from "@/components/messaging/ConversationListItem";

type ConversationListProps = {
  items: ConversationListItemType[];
};

export function ConversationList({ items }: ConversationListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-slate)]">
        No conversations yet. Connect with someone from{" "}
        <Link href="/discover" className="text-[var(--color-lobby-teal)] underline">
          Discover
        </Link>{" "}
        or{" "}
        <Link href="/connections" className="text-[var(--color-lobby-teal)] underline">
          Connections
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="space-y-4" role="list">
      {items.map((item) => (
        <ConversationListItem key={item.conversationId} item={item} />
      ))}
    </ul>
  );
}
