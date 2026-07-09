"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createOpenSeat, type ActionResult } from "@/domains/groups/actions";

const initial: ActionResult | null = null;

type OpenSeatFormProps = {
  groupId: string;
  unavailableAccountId: string;
  unavailableDisplayName: string;
};

export function OpenSeatForm({
  groupId,
  unavailableAccountId,
  unavailableDisplayName,
}: OpenSeatFormProps) {
  const [state, formAction, pending] = useActionState(createOpenSeat, initial);

  return (
    <section className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
        Open seat
      </h2>
      <p className="text-sm text-[var(--color-text-slate)]">
        {unavailableDisplayName} is unavailable. Mark an open seat so your group can look
        for a replacement on{" "}
        <Link href="/discover" className="text-[var(--color-lobby-teal)] underline">
          Discover
        </Link>
        .
      </p>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="groupId" value={groupId} />
        <input
          type="hidden"
          name="unavailableAccountId"
          value={unavailableAccountId}
        />
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Duration</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="kind" value="temporary" defaultChecked required />
            Temporary
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="kind" value="permanent" />
            Permanent
          </label>
        </fieldset>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Role note (optional)</span>
          <input
            name="roleNote"
            type="text"
            maxLength={200}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
            placeholder="e.g. Support main, evenings PT"
          />
        </label>
        {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
        {state?.ok && (
          <Alert variant="success" role="status">
            Open seat recorded. Browse Discover when you are ready.
          </Alert>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Mark open seat"}
        </Button>
      </form>
    </section>
  );
}
