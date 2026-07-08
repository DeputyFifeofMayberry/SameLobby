"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { optInToDemand } from "@/domains/discovery/actions";

export function DemandOptInForm() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await optInToDemand(null);
        });
      }}
    >
      {pending ? "Saving…" : "Notify me when discovery opens"}
    </Button>
  );
}
