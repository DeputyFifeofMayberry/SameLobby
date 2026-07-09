"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { unblockAccount } from "@/domains/connections/actions";

type BlockedUserRowProps = {
  accountId: string;
  displayName: string;
};

export function BlockedUserRow({ accountId, displayName }: BlockedUserRowProps) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
      <Link href={`/profile/${accountId}`} className="font-medium hover:underline">
        {displayName}
      </Link>
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={() =>
          startTransition(() => {
            void unblockAccount(accountId);
          })
        }
      >
        Unblock
      </Button>
    </li>
  );
}
