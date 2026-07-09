"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { submitAppeal, type ActionResult } from "@/domains/moderation/actions";
import type { EligibleAppeal } from "@/domains/moderation/types";

const initial: ActionResult | null = null;

type AppealFormProps = {
  appeal: EligibleAppeal;
};

export function AppealForm({ appeal }: AppealFormProps) {
  const [state, formAction, pending] = useActionState(submitAppeal, initial);

  if (state?.ok) {
    return (
      <Alert variant="success" role="status">
        Appeal submitted. We will review it within the appeal window.
      </Alert>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
    >
      <p className="text-sm font-medium">
        Appeal {appeal.actionType.replace(/_/g, " ")} (deadline{" "}
        {new Date(appeal.appealDeadlineAt).toLocaleDateString()})
      </p>
      <input type="hidden" name="actionId" value={appeal.actionId} />
      <textarea
        name="body"
        required
        minLength={10}
        maxLength={2000}
        rows={3}
        className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
        placeholder="Why should we review this action?"
      />
      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit appeal"}
      </Button>
    </form>
  );
}
