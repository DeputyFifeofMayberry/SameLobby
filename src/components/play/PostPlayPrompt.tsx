"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  submitPostPlayFeedback,
  type ActionResult,
} from "@/domains/play/actions";
import {
  POST_PLAY_CONTINUATION_LABELS,
  type PostPlayContinuation,
} from "@/domains/play/types";

const initial: ActionResult | null = null;

const OPTIONS: PostPlayContinuation[] = [
  "keep_chatting",
  "play_again",
  "add_teammate",
  "add_to_group",
  "not_now",
];

type PostPlayPromptProps = {
  sessionId: string;
  otherAccountId?: string;
};

export function PostPlayPrompt({ sessionId, otherAccountId }: PostPlayPromptProps) {
  const [selected, setSelected] = useState<PostPlayContinuation>(OPTIONS[0]);
  const [state, formAction, pending] = useActionState(
    submitPostPlayFeedback,
    initial,
  );

  if (state?.ok) {
    return (
      <Alert variant="success" role="status">
        Thanks — your response is private. We never show what the other player chose.
        {selected === "add_to_group" && otherAccountId && (
          <span className="mt-2 block">
            <Link
              href={`/groups/new?invite=${otherAccountId}`}
              className="font-medium underline"
            >
              Create a private group with this connection
            </Link>
          </span>
        )}
      </Alert>
    );
  }

  return (
    <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-cloud)] p-5">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
        Keep this connection going?
      </h2>
      <p className="text-sm text-[var(--color-text-slate)]">
        Your choice is private — the other player will not see it. Teammate upgrades
        only happen when you both choose the same thing.
      </p>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="sessionId" value={sessionId} />
        <fieldset className="space-y-2">
          <legend className="sr-only">Continuation preference</legend>
          {OPTIONS.map((option) => (
            <label
              key={option}
              className="flex min-h-[var(--touch-min)] cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="continuation"
                value={option}
                required
                onChange={() => setSelected(option)}
              />
              {POST_PLAY_CONTINUATION_LABELS[option]}
            </label>
          ))}
        </fieldset>
        {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save response"}
        </Button>
      </form>
    </section>
  );
}
