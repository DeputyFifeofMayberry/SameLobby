"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { voteGroupInvitation } from "@/domains/groups/actions";
import type { PendingMemberApproval } from "@/domains/groups/types";

type GroupApprovalCardProps = {
  approval: PendingMemberApproval;
};

export function GroupApprovalCard({ approval }: GroupApprovalCardProps) {
  const [pending, startTransition] = useTransition();

  if (!approval.invitationId) return null;

  return (
    <article className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-cloud)] p-4">
      <p className="text-sm">
        <span className="font-medium">{approval.inviteeDisplayName}</span> wants to join
        {approval.viewerVote === null
          ? " — your vote is needed."
          : approval.viewerVote
            ? " — you approved."
            : " — you declined."}
      </p>
      {approval.viewerVote === null && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await voteGroupInvitation(approval.invitationId, true);
              })
            }
          >
            Approve
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await voteGroupInvitation(approval.invitationId, false);
              })
            }
          >
            Decline
          </Button>
        </div>
      )}
    </article>
  );
}
