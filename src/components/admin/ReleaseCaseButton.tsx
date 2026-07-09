"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { releaseCase } from "@/domains/admin/actions";

export function ReleaseCaseButton({ caseId }: { caseId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <Alert variant="success" role="status">
        Case released and restrictions lifted.
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={() => {
          if (
            !window.confirm(
              "Release this case? Restrictions on the reported user will be lifted.",
            )
          ) {
            return;
          }
          setError(null);
          startTransition(async () => {
            const result = await releaseCase(caseId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setDone(true);
          });
        }}
      >
        {pending ? "Releasing…" : "Release case"}
      </Button>
      {error && (
        <Alert variant="error" role="alert" aria-live="assertive">
          {error}
        </Alert>
      )}
    </div>
  );
}
