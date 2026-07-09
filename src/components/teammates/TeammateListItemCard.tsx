"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { promoteRegularTeammate } from "@/domains/teammates/actions";
import type { TeammateListItem } from "@/domains/teammates/types";

type TeammateListItemCardProps = {
  teammate: TeammateListItem;
};

export function TeammateListItemCard({ teammate }: TeammateListItemCardProps) {
  const [pending, startTransition] = useTransition();

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
            <Link
              href={`/teammates/${teammate.id}`}
              className="text-[var(--color-night-navy)] underline-offset-2 hover:underline"
            >
              {teammate.otherDisplayName}
            </Link>
            {teammate.isRegular && (
              <span className="ml-2 text-sm font-medium text-[var(--color-lobby-teal)]">
                Regular
              </span>
            )}
          </h3>
          {teammate.sharedGameLabels.length > 0 && (
            <p className="mt-1 text-sm text-[var(--color-text-slate)]">
              {teammate.sharedGameLabels.join(", ")}
            </p>
          )}
        </div>
      </div>

      {!teammate.isRegular && (
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await promoteRegularTeammate(teammate.id);
              })
            }
          >
            {pending ? "Saving…" : "Mark as regular teammate"}
          </Button>
        </div>
      )}
    </article>
  );
}
