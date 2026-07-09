"use client";

import { useActionState } from "react";
import {
  updateProfileCommunication,
  type ActionResult,
} from "@/domains/profile/actions";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Alert } from "@/components/ui/Alert";
import {
  COMMUNICATION_MODES,
  COMMUNICATION_MODE_LABELS,
  type CommunicationMode,
} from "@/domains/profile/types";

const initial: ActionResult | null = null;

type Props = {
  defaultModes?: CommunicationMode[];
};

export function ProfileCommunicationForm({ defaultModes = [] }: Props) {
  const [state, formAction, pending] = useActionState(
    updateProfileCommunication,
    initial,
  );

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Communication capability</legend>
        {COMMUNICATION_MODES.map((mode) => (
          <Checkbox
            key={mode}
            id={`communication-${mode}`}
            name="modes"
            value={mode}
            label={COMMUNICATION_MODE_LABELS[mode]}
            defaultChecked={defaultModes.includes(mode)}
          />
        ))}
      </fieldset>
      {state && !state.ok && (
        <Alert variant="error" role="alert">
          {state.error}
        </Alert>
      )}
      {state?.ok && (
        <Alert variant="success" role="status">
          Communication preferences updated.
        </Alert>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save communication"}
      </Button>
    </form>
  );
}
