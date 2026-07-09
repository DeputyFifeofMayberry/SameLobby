"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { resolveAppeal } from "@/domains/admin/actions";

type AppealReviewPanelProps = {
  appealId: string;
  caseId: string;
  subjectAccountId: string;
  body: string;
  status: string;
};

export function AppealReviewPanel({
  appealId,
  caseId,
  subjectAccountId,
  body,
  status,
}: AppealReviewPanelProps) {
  const [pending, startTransition] = useTransition();

  if (status !== "submitted" && status !== "under_review") {
    return (
      <p className="text-sm text-[var(--color-text-slate)]">
        Appeal {status.replace(/_/g, " ")}.
      </p>
    );
  }

  function decide(decision: "upheld" | "modified" | "reversed") {
    startTransition(async () => {
      await resolveAppeal(appealId, caseId, decision, subjectAccountId);
    });
  }

  return (
    <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
      <p className="text-sm whitespace-pre-wrap">{body}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={pending} onClick={() => decide("upheld")}>
          Uphold
        </Button>
        <Button type="button" variant="secondary" disabled={pending} onClick={() => decide("modified")}>
          Modify
        </Button>
        <Button type="button" variant="destructive" disabled={pending} onClick={() => decide("reversed")}>
          Reverse
        </Button>
      </div>
    </div>
  );
}
