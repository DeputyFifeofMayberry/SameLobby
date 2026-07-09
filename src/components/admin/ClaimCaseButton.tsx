"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { claimCase } from "@/domains/admin/actions";

export function ClaimCaseButton({ caseId }: { caseId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          void claimCase(caseId);
        })
      }
    >
      {pending ? "Claiming…" : "Claim case"}
    </Button>
  );
}
