"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { saveSavedSearch } from "@/domains/discovery/saved-searches-actions";
import type { ActionResult } from "@/domains/discovery/saved-searches-actions";

type SaveSearchFormProps = {
  filters: {
    q?: string;
    gameId?: string;
    platformId?: string;
    goal?: string;
  };
  canSave: boolean;
};

export function SaveSearchForm({ filters, canSave }: SaveSearchFormProps) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(saveSavedSearch, null);

  if (!canSave) return null;

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4"
    >
      <h3 className="font-medium">Save this search</h3>
      <input type="hidden" name="q" value={filters.q ?? ""} />
      <input type="hidden" name="gameId" value={filters.gameId ?? ""} />
      <input type="hidden" name="platformId" value={filters.platformId ?? ""} />
      <input type="hidden" name="goal" value={filters.goal ?? ""} />
      <label className="block text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          required
          maxLength={80}
          className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
          placeholder="e.g. Apex ranked evenings"
        />
      </label>
      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
      {state?.ok && <Alert variant="success">Search saved.</Alert>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save search"}
      </Button>
    </form>
  );
}
