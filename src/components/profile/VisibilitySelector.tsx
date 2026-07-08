"use client";

import { useActionState } from "react";
import { Select } from "@/components/ui/Select";
import {
  updateDisclosureVisibility,
  type ActionResult,
} from "@/domains/profile/actions";
import { VISIBILITY_LABELS, type VisibilityLevel } from "@/domains/profile/types";

const initial: ActionResult | null = null;

type Props = {
  fieldKey: string;
  current: VisibilityLevel;
};

export function VisibilitySelector({ fieldKey, current }: Props) {
  const [state, formAction, pending] = useActionState(
    updateDisclosureVisibility,
    initial,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="fieldKey" value={fieldKey} />
      <Select
        name="visibility"
        defaultValue={current}
        aria-label={`Visibility for ${fieldKey}`}
        className="max-w-xs"
      >
        {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-[var(--color-lobby-teal)] underline disabled:opacity-50"
      >
        {pending ? "Saving…" : "Update"}
      </button>
      {state && !state.ok && (
        <span className="text-xs text-[var(--color-error)]">{state.error}</span>
      )}
    </form>
  );
}
