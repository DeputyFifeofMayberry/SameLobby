"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { blockAccount } from "@/domains/connections/actions";

type BlockUserButtonProps = {
  targetAccountId: string;
  targetDisplayName: string;
};

export function BlockUserButton({
  targetAccountId,
  targetDisplayName,
}: BlockUserButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(
            `Block ${targetDisplayName}? They will not be able to contact you or appear in your discovery results.`,
          )
        ) {
          return;
        }
        startTransition(async () => {
          await blockAccount(targetAccountId);
        });
      }}
    >
      {pending ? "Blocking…" : "Block"}
    </Button>
  );
}
