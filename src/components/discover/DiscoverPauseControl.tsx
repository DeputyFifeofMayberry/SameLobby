"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { setDiscoveryPaused } from "@/domains/discovery/actions";

type DiscoverPauseControlProps = {
  paused: boolean;
};

export function DiscoverPauseControl({ paused }: DiscoverPauseControlProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4">
      <div>
        <p className="text-sm font-medium">Discovery visibility</p>
        <p className="text-sm text-[var(--color-text-slate)]">
          {paused
            ? "You are hidden from recommendations and search."
            : "You appear in recommendations when eligible."}
        </p>
      </div>
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await setDiscoveryPaused(!paused);
          });
        }}
      >
        {pending ? "Saving…" : paused ? "Resume discovery" : "Pause discovery"}
      </Button>
    </div>
  );
}
