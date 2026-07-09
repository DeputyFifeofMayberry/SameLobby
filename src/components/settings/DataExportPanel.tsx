"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { exportMyData } from "@/domains/moderation/actions";

export function DataExportPanel() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-text-slate)]">
        Download a JSON export of your account data. Other players&apos; personal
        details are not included.
      </p>
      {error && <Alert variant="error">{error}</Alert>}
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await exportMyData();
            if (!result.ok) {
              setError(result.error);
              return;
            }
            const blob = new Blob([JSON.stringify(result.data, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "samelobby-export.json";
            anchor.click();
            URL.revokeObjectURL(url);
          })
        }
      >
        {pending ? "Preparing…" : "Download my data"}
      </Button>
      <p className="text-xs text-[var(--color-text-slate)]">
        <Link href="/settings/account" className="underline">
          Account settings
        </Link>
      </p>
    </div>
  );
}
