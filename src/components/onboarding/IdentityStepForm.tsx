"use client";

import { useActionState } from "react";
import {
  saveIdentityStep,
  type ActionResult,
} from "@/domains/profile/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { TIME_ZONE_OPTIONS } from "@/lib/timezones";

const initial: ActionResult | null = null;

type Props = {
  defaultDisplayName?: string;
  defaultTimeZone?: string;
};

export function IdentityStepForm({
  defaultDisplayName = "",
  defaultTimeZone = "",
}: Props) {
  const [state, formAction, pending] = useActionState(
    saveIdentityStep,
    initial,
  );

  return (
    <form action={formAction} className="mx-auto max-w-lg space-y-6">
      <div>
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          required
          defaultValue={defaultDisplayName}
          autoComplete="nickname"
          aria-describedby="displayName-hint"
        />
        <p id="displayName-hint" className="mt-1 text-xs text-[var(--color-text-slate)]">
          3–24 characters. Letters, numbers, underscores, hyphens.
        </p>
      </div>
      <div>
        <Label htmlFor="timeZone">Time zone</Label>
        <Select id="timeZone" name="timeZone" required defaultValue={defaultTimeZone}>
          <option value="" disabled>
            Select your time zone
          </option>
          {TIME_ZONE_OPTIONS.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </Select>
      </div>
      {state && !state.ok && (
        <Alert variant="error" role="alert">
          {state.error}
        </Alert>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
