"use client";

import { useActionState } from "react";
import {
  completeAttestation,
  type ActionResult,
} from "@/domains/accounts/actions";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

const initial: ActionResult | null = null;

export function AttestationForm() {
  const [state, formAction, pending] = useActionState(
    completeAttestation,
    initial,
  );

  return (
    <form action={formAction} className="mx-auto max-w-lg space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold text-[var(--color-night-navy)]">
          Confirm you are 18 or older
        </legend>
        <label className="flex gap-3 text-sm">
          <input
            type="checkbox"
            name="adultConfirmed"
            className="mt-1"
            required
          />
          <span>
            I am 18 years of age or older and want to use SameLobby for platonic
            gaming friendships and teammates.
          </span>
        </label>
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="sr-only">Policy agreements</legend>
        <label className="flex gap-3 text-sm">
          <input type="checkbox" name="termsAccepted" required />
          <span>
            I accept the{" "}
            <a
              href="/safety"
              className="text-[var(--color-lobby-teal)] underline"
            >
              Terms of Service
            </a>
            .
          </span>
        </label>
        <label className="flex gap-3 text-sm">
          <input type="checkbox" name="privacyAccepted" required />
          <span>
            I accept the{" "}
            <a
              href="/safety"
              className="text-[var(--color-lobby-teal)] underline"
            >
              Privacy Notice
            </a>
            .
          </span>
        </label>
        <label className="flex gap-3 text-sm">
          <input type="checkbox" name="communityStandardsAccepted" required />
          <span>
            I accept the{" "}
            <a
              href="/safety"
              className="text-[var(--color-lobby-teal)] underline"
            >
              Community Standards
            </a>
            .
          </span>
        </label>
      </fieldset>
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
