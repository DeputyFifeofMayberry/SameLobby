"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { MessageComposer } from "@/components/messaging/MessageComposer";
import { useConversationRealtime } from "@/domains/messaging/useConversationRealtime";
import type { Message } from "@/domains/messaging/types";

type GroupMessageThreadClientProps = {
  conversationId: string;
  viewerAccountId: string;
  groupId: string | null;
  groupName: string;
  initialMessages: Message[];
  senderDisplayNames: Record<string, string>;
  linksInMessagesEnabled: boolean;
  canSend: boolean;
};

export function GroupMessageThreadClient({
  conversationId,
  viewerAccountId,
  groupId,
  groupName,
  initialMessages,
  senderDisplayNames,
  linksInMessagesEnabled,
  canSend,
}: GroupMessageThreadClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  const handleRealtimeMessage = useCallback((row: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === row.id)) return prev;
      return [...prev, row];
    });
  }, []);

  useConversationRealtime(conversationId, handleRealtimeMessage);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/messages" className="text-sm text-[var(--color-lobby-teal)] underline">
          ← Messages
        </Link>
        {groupId && (
          <Link
            href={`/groups/${groupId}`}
            className="text-sm text-[var(--color-lobby-teal)] underline"
          >
            Group details
          </Link>
        )}
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={`${groupName} message history`}
        className="flex max-h-[50vh] min-h-[200px] flex-col gap-3 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-[var(--color-text-slate)]">
            No messages yet. Say hello to your group.
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_account_id === viewerAccountId;
            const senderName = isMine
              ? "You"
              : (senderDisplayNames[message.sender_account_id] ?? "Member");
            const timeLabel = new Date(message.created_at).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            });
            return (
              <article
                key={message.id}
                aria-label={`${senderName}, ${timeLabel}`}
                className={`max-w-[85%] rounded-[var(--radius-md)] px-3 py-2 text-sm ${
                  isMine
                    ? "ml-auto bg-[var(--color-lobby-teal)] text-white"
                    : "bg-[var(--color-cloud)] text-[var(--color-night-navy)]"
                }`}
              >
                {!isMine && (
                  <p className="mb-1 text-xs font-medium opacity-80">{senderName}</p>
                )}
                {message.body}
              </article>
            );
          })
        )}
      </div>

      <MessageComposer
        conversationId={conversationId}
        linksInMessagesEnabled={linksInMessagesEnabled}
        disabled={!canSend}
        draft={draft}
        onDraftChange={setDraft}
      />
    </div>
  );
}
