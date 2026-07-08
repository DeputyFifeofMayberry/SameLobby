"use client";

import { useActionState } from "react";
import {
  updateProfileIdentity,
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

export function ProfileIdentityForm({
  defaultDisplayName = "",
  defaultTimeZone = "",
}: Props) {
  const [state, formAction, pending] = useActionState(
    updateProfileIdentity,
    initial,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          required
          defaultValue={defaultDisplayName}
        />
      </div>
      <div>
        <Label htmlFor="timeZone">Time zone</Label>
        <Select
          id="timeZone"
          name="timeZone"
          required
          defaultValue={defaultTimeZone}
        >
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
      {state?.ok && (
        <Alert variant="success" role="status">
          Profile updated.
        </Alert>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save identity"}
      </Button>
    </form>
  );
}
