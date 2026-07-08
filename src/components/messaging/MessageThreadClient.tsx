"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { IcebreakerChips } from "@/components/messaging/IcebreakerChips";
import { MessageComposer } from "@/components/messaging/MessageComposer";
import { ReportForm } from "@/components/messaging/ReportForm";
import { Button } from "@/components/ui/Button";
import { useConversationRealtime } from "@/domains/messaging/useConversationRealtime";
import { blockInConversation } from "@/domains/messaging/actions";
import type { Message } from "@/domains/messaging/types";

type MessageThreadClientProps = {
  conversationId: string;
  viewerAccountId: string;
  otherAccountId: string;
  otherDisplayName: string;
  initialMessages: Message[];
  icebreakers: string[];
  linksInMessagesEnabled: boolean;
  canSend: boolean;
};

export function MessageThreadClient({
  conversationId,
  viewerAccountId,
  otherAccountId,
  otherDisplayName,
  initialMessages,
  icebreakers,
  linksInMessagesEnabled,
  canSend,
}: MessageThreadClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  const handleRealtimeMessage = useCallback((row: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === row.id)) return prev;
      return [...prev, row];
    });
  }, []);

  useConversationRealtime(conversationId, handleRealtimeMessage);

  const handleBlock = useCallback(() => {
    if (
      !window.confirm(
        `Block ${otherDisplayName}? You will not be able to message each other.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await blockInConversation(conversationId, otherAccountId);
    });
  }, [conversationId, otherAccountId, otherDisplayName]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/messages" className="text-sm text-[var(--color-lobby-teal)] underline">
          ← Messages
        </Link>
        <div className="flex flex-wrap gap-2">
          <ReportForm
            reportedAccountId={otherAccountId}
            conversationId={conversationId}
            reportedDisplayName={otherDisplayName}
          />
          <Button type="button" variant="destructive" disabled={pending} onClick={handleBlock}>
            {pending ? "Blocking…" : "Block"}
          </Button>
        </div>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Message history"
        className="flex max-h-[50vh] min-h-[200px] flex-col gap-3 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-[var(--color-text-slate)]">
            No messages yet. Say hello — icebreakers below can help.
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_account_id === viewerAccountId;
            const timeLabel = new Date(message.created_at).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            });
            return (
              <article
                key={message.id}
                aria-label={`${isMine ? "You" : otherDisplayName}, ${timeLabel}`}
                className={`max-w-[85%] rounded-[var(--radius-md)] px-3 py-2 text-sm ${
                  isMine
                    ? "ml-auto bg-[var(--color-lobby-teal)] text-white"
                    : "bg-[var(--color-cloud)] text-[var(--color-night-navy)]"
                }`}
              >
                {message.body}
              </article>
            );
          })
        )}
      </div>

      {messages.length === 0 && (
        <IcebreakerChips
          suggestions={icebreakers}
          onSelect={(text) => setDraft(text)}
          disabled={!canSend}
        />
      )}

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
