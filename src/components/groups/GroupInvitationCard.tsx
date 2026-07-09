"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { acceptGroupInvitation } from "@/domains/groups/actions";
import type { GroupInvitationListItem } from "@/domains/groups/types";

type GroupInvitationCardProps = {
  invitation: GroupInvitationListItem;
};

export function GroupInvitationCard({ invitation }: GroupInvitationCardProps) {
  const [pending, startTransition] = useTransition();

  const expiresLabel = new Date(invitation.expiresAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
        <Link href={`/groups/${invitation.groupId}`} className="hover:underline">
          {invitation.groupName}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-slate)]">
        Invited by {invitation.inviterDisplayName} · Expires {expiresLabel}
      </p>
      <div className="mt-4">
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await acceptGroupInvitation(invitation.id);
            })
          }
        >
          {pending ? "Accepting…" : "Accept invitation"}
        </Button>
      </div>
    </article>
  );
}
