"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { proposeTeammate } from "@/domains/teammates/actions";

type ProposeTeammateFormProps = {
  eligible: { accountId: string; displayName: string }[];
};

export function ProposeTeammateForm({ eligible }: ProposeTeammateFormProps) {
  const [pending, startTransition] = useTransition();

  if (eligible.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-slate)]">
        Play at least one completed session with a connection before proposing a teammate.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {eligible.map((player) => (
        <li
          key={player.accountId}
          className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-3"
        >
          <span className="text-sm font-medium">{player.displayName}</span>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await proposeTeammate(player.accountId);
              })
            }
          >
            Propose teammate
          </Button>
        </li>
      ))}
    </ul>
  );
}
