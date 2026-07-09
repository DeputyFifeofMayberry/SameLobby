"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import {
  affirmTeammateProposal,
  endTeammateRelationship,
} from "@/domains/teammates/actions";
import type { TeammateListItem } from "@/domains/teammates/types";

type TeammateProposalCardProps = {
  teammate: TeammateListItem;
};

export function TeammateProposalCard({ teammate }: TeammateProposalCardProps) {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      await action();
    });
  }

  const directionLabel =
    teammate.direction === "incoming"
      ? "Incoming proposal"
      : teammate.direction === "outgoing"
        ? "Sent proposal"
        : "Proposal";

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
            <Link
              href={`/profile/${teammate.otherAccountId}`}
              className="text-[var(--color-night-navy)] underline-offset-2 hover:underline"
            >
              {teammate.otherDisplayName}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-slate)]">{directionLabel}</p>
          {teammate.sharedGameLabels.length > 0 && (
            <p className="mt-1 text-xs text-[var(--color-text-slate)]">
              Shared: {teammate.sharedGameLabels.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {teammate.direction === "incoming" && (
          <Button
            type="button"
            disabled={pending}
            onClick={() => run(() => affirmTeammateProposal(teammate.id))}
          >
            Affirm teammate
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => run(() => endTeammateRelationship(teammate.id))}
        >
          End
        </Button>
        <Link
          href={`/teammates/${teammate.id}`}
          className="inline-flex min-h-[var(--touch-min)] items-center text-sm text-[var(--color-lobby-teal)] underline"
        >
          Details
        </Link>
      </div>
    </article>
  );
}
