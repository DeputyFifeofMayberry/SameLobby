"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/domains/messaging/types";

export function useConversationRealtime(
  conversationId: string,
  onMessage: (message: Message) => void,
) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, onMessage]);
}
