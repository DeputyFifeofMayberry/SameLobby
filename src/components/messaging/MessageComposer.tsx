"use client";

import { useActionState, useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { sendMessage, type ActionResult } from "@/domains/messaging/actions";
import { MAX_MESSAGE_LENGTH } from "@/domains/messaging/constants";
import { containsLink } from "@/domains/messaging/schemas";

type MessageComposerProps = {
  conversationId: string;
  linksInMessagesEnabled: boolean;
  disabled?: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
};

export function MessageComposer({
  conversationId,
  linksInMessagesEnabled,
  disabled = false,
  draft,
  onDraftChange,
}: MessageComposerProps) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    sendMessage,
    null,
  );
  const [linkWarning, setLinkWarning] = useState(false);
  const [allowLinks, setAllowLinks] = useState(false);
  useEffect(() => {
    if (state?.ok) {
      onDraftChange("");
      setLinkWarning(false);
      setAllowLinks(false);
    }
  }, [state, onDraftChange]);

  function handleSubmit(formData: FormData) {
    const text = formData.get("body")?.toString() ?? "";
    if (!linksInMessagesEnabled && containsLink(text) && !allowLinks) {
      setLinkWarning(true);
      return;
    }
    formAction(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-3 border-t border-[var(--color-border)] pt-4">
      <input type="hidden" name="conversationId" value={conversationId} />
      {allowLinks && <input type="hidden" name="allowLinks" value="true" />}

      <div>
        <Label htmlFor="message-composer-input">Message</Label>
        <Input
          id="message-composer-input"
          name="body"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="Write a message"
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={disabled || pending}
        />
      </div>

      {linkWarning && (
        <Alert variant="error" role="alert">
          This message contains a link. Links are limited for safety.
          <div className="mt-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setAllowLinks(true);
                setLinkWarning(false);
              }}
            >
              Send anyway
            </Button>
            <Button type="button" variant="ghost" onClick={() => setLinkWarning(false)}>
              Edit message
            </Button>
          </div>
        </Alert>
      )}

      {state && !state.ok && (
        <Alert variant="error" role="alert">
          {state.error}
        </Alert>
      )}

      <Button type="submit" disabled={disabled || pending || !draft.trim()}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
