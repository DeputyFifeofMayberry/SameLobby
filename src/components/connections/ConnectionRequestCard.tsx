"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ReportForm } from "@/components/messaging/ReportForm";
import {
  acceptConnectionRequest,
  cancelConnectionRequest,
  declineConnectionRequest,
} from "@/domains/connections/actions";
import type { ConnectionRequestView } from "@/domains/connections/types";

type ConnectionRequestCardProps = {
  request: ConnectionRequestView;
  reportingEnabled?: boolean;
};

export function ConnectionRequestCard({
  request,
  reportingEnabled = false,
}: ConnectionRequestCardProps) {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      await action();
    });
  }

  const expiresLabel = new Date(request.expires_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
            <Link
              href={`/profile/${request.otherAccountId}`}
              className="text-[var(--color-night-navy)] underline-offset-2 hover:underline"
            >
              {request.otherDisplayName}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-slate)]">
            {request.direction === "incoming" ? "Incoming request" : "Sent request"} ·{" "}
            {request.status}
          </p>
          {request.status === "pending" && (
            <p className="mt-1 text-xs text-[var(--color-text-slate)]">
              Expires {expiresLabel}
            </p>
          )}
        </div>
      </div>

      {request.message && (
        <p className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-cloud)] p-3 text-sm">
          {request.message}
        </p>
      )}

      {request.direction === "incoming" && request.status === "pending" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pending}
            onClick={() => run(() => acceptConnectionRequest(request.id))}
          >
            Accept
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => declineConnectionRequest(request.id))}
          >
            Decline
          </Button>
        </div>
      )}

      {request.direction === "outgoing" && request.status === "pending" && (
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => cancelConnectionRequest(request.id))}
          >
            Cancel request
          </Button>
        </div>
      )}

      {reportingEnabled && request.status === "pending" && (
        <div className="mt-4">
          <ReportForm
            reportedAccountId={request.otherAccountId}
            reportedDisplayName={request.otherDisplayName}
          />
        </div>
      )}
    </article>
  );
}
