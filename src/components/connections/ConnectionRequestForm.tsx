"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  sendConnectionRequest,
  type ActionResult,
} from "@/domains/connections/actions";
import { MAX_REQUEST_MESSAGE_LENGTH } from "@/domains/connections/constants";

type ConnectionRequestFormProps = {
  recipientAccountId: string;
  recipientDisplayName: string;
};

export function ConnectionRequestForm({
  recipientAccountId,
  recipientDisplayName,
}: ConnectionRequestFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    sendConnectionRequest,
    null,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Send connection request
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-slate)]">
          Introduce yourself to {recipientDisplayName}. Messaging opens after you
          both accept.
        </p>
      </div>

      <input type="hidden" name="recipientAccountId" value={recipientAccountId} />

      <div>
        <Label htmlFor="connection-message">Optional note</Label>
        <Input
          id="connection-message"
          name="message"
          maxLength={MAX_REQUEST_MESSAGE_LENGTH}
          placeholder="What game or schedule works for you?"
        />
        <p className="mt-1 text-xs text-[var(--color-text-slate)]">
          Up to {MAX_REQUEST_MESSAGE_LENGTH} characters. No links.
        </p>
      </div>

      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
      {state?.ok && (
        <Alert variant="success">Request sent. You can track it under Connections.</Alert>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send request"}
      </Button>
    </form>
  );
}
