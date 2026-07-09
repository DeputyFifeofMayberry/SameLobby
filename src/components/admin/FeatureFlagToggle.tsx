"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { setFeatureFlag } from "@/domains/admin/actions";

export function FeatureFlagToggle({
  flagKey,
  enabled,
}: {
  flagKey: string;
  enabled: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={enabled ? "secondary" : "primary"}
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          void setFeatureFlag(flagKey, !enabled);
        })
      }
    >
      {pending ? "Saving…" : enabled ? "Disable" : "Enable"}
    </Button>
  );
}
