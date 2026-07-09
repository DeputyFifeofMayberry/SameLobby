"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { addCaseNote } from "@/domains/admin/actions";

type CaseNotesPanelProps = {
  caseId: string;
  notes: { id: string; body: string; createdAt: string }[];
};

export function CaseNotesPanel({ caseId, notes }: CaseNotesPanelProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="space-y-3">
      <h2 className="font-bold">Internal notes</h2>
      <p className="text-xs text-[var(--color-text-slate)]">
        Admin-only. Never visible to users.
      </p>
      <ul className="space-y-2">
        {notes.length === 0 ? (
          <li className="text-sm text-[var(--color-text-slate)]">
            No notes yet.
          </li>
        ) : (
          notes.map((note) => (
            <li
              key={note.id}
              className="rounded-[var(--radius-md)] bg-[var(--color-cloud)] p-3 text-sm whitespace-pre-wrap"
            >
              <p>{note.body}</p>
              <p className="mt-1 text-xs text-[var(--color-text-slate)]">
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </li>
          ))
        )}
      </ul>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await addCaseNote(caseId, body);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setBody("");
          });
        }}
      >
        <label className="text-sm font-medium" htmlFor="case-note">
          Add note
        </label>
        <textarea
          id="case-note"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          required
          maxLength={4000}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
        />
        {error && (
          <Alert variant="error" role="alert" aria-live="assertive">
            {error}
          </Alert>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save note"}
        </Button>
      </form>
    </section>
  );
}
