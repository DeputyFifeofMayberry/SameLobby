"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { setRegistrationCap } from "@/domains/admin/actions";

type RegistrationCapControlProps = {
  maxAccounts: number;
  currentCount: number;
  enabled: boolean;
};

export function RegistrationCapControl({
  maxAccounts,
  currentCount,
  enabled,
}: RegistrationCapControlProps) {
  const [value, setValue] = useState(String(maxAccounts));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const utilization =
    maxAccounts > 0 ? Math.round((currentCount / maxAccounts) * 100) : 0;

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4">
      <p className="font-medium">Registration cap</p>
      <p className="mt-1 text-sm text-[var(--color-text-slate)]">
        {currentCount.toLocaleString()} / {maxAccounts.toLocaleString()}{" "}
        accounts ({utilization}% utilized)
        {!enabled && " · cap enforcement disabled"}
      </p>
      <form
        className="mt-3 flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setSaved(false);
          startTransition(async () => {
            const result = await setRegistrationCap(Number(value));
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setSaved(true);
          });
        }}
      >
        <div>
          <label className="text-sm" htmlFor="registration-cap">
            Max accounts
          </label>
          <input
            id="registration-cap"
            type="number"
            min={1}
            max={1000000}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 block w-40 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Update cap"}
        </Button>
      </form>
      {saved && (
        <Alert
          variant="success"
          role="status"
          className="mt-2"
          aria-live="polite"
        >
          Registration cap updated.
        </Alert>
      )}
      {error && (
        <Alert
          variant="error"
          role="alert"
          className="mt-2"
          aria-live="assertive"
        >
          {error}
        </Alert>
      )}
    </div>
  );
}
