"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { saveTeammateNote, type ActionResult } from "@/domains/teammates/actions";
import { MAX_TEAMMATE_NOTE_LENGTH } from "@/domains/teammates/constants";

const initial: ActionResult | null = null;

type TeammateNoteEditorProps = {
  relationshipId: string;
  initialBody: string | null;
};

export function TeammateNoteEditor({
  relationshipId,
  initialBody,
}: TeammateNoteEditorProps) {
  const [state, formAction, pending] = useActionState(saveTeammateNote, initial);

  return (
    <section className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
        Private note
      </h2>
      <p className="text-sm text-[var(--color-text-slate)]">
        Only you can see this note — it is never shared with your teammate.
      </p>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="relationshipId" value={relationshipId} />
        <label className="block space-y-1">
          <span className="sr-only">Note</span>
          <textarea
            name="body"
            defaultValue={initialBody ?? ""}
            maxLength={MAX_TEAMMATE_NOTE_LENGTH}
            rows={4}
            required
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
            placeholder="Play style, roles, scheduling tips…"
          />
        </label>
        {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
        {state?.ok && (
          <Alert variant="success" role="status">
            Note saved.
          </Alert>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save note"}
        </Button>
      </form>
    </section>
  );
}
