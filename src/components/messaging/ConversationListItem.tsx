import Link from "next/link";
import type { ConversationListItem as ConversationListItemType } from "@/domains/messaging/types";

type ConversationListItemProps = {
  item: ConversationListItemType;
};

export function ConversationListItem({ item }: ConversationListItemProps) {
  return (
    <li>
      <Link
        href={`/messages/${item.conversationId}`}
        className="block rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 transition-colors hover:bg-[var(--color-cloud)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              {item.otherDisplayName}
              {item.unread && (
                <span className="ml-2 text-sm font-medium text-[var(--color-lobby-teal)]">
                  Unread
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-slate)]">
              {item.sharedGameLabel
                ? `Connected · ${item.sharedGameLabel}`
                : "Connected"}
            </p>
            {item.lastMessagePreview && (
              <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-slate)]">
                {item.lastMessagePreview}
              </p>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
