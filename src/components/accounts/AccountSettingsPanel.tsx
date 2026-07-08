"use client";

import { useActionState } from "react";
import {
  requestAccountDeletion,
  signOut,
  type ActionResult,
} from "@/domains/accounts/actions";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { Account } from "@/domains/accounts/types";

const initial: ActionResult | null = null;

export function AccountSettingsPanel({ account }: { account: Account }) {
  const [state, formAction, pending] = useActionState(
    requestAccountDeletion,
    initial,
  );

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="mt-2 text-sm text-[var(--color-text-slate)]">
          Status: <strong>{account.status}</strong>
        </p>
        <form action={signOut} className="mt-4">
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-bg)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-error)]">
          Delete account
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-slate)]">
          Your profile will be removed from discovery immediately. Safety and
          block records may be retained as described in the Privacy Notice. Full
          deletion processing is completed by automated jobs in a later slice.
        </p>
        {state?.ok && (
          <Alert variant="success" className="mt-4">
            Deletion requested. Your account is marked for processing.
          </Alert>
        )}
        <form action={formAction} className="mt-4 space-y-4">
          <label className="flex gap-3 text-sm">
            <input type="checkbox" name="confirm" required />
            <span>I understand this will begin account deletion.</span>
          </label>
          {state && !state.ok && (
            <Alert variant="error" role="alert">
              {state.error}
            </Alert>
          )}
          <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? "Requesting…" : "Request account deletion"}
          </Button>
        </form>
      </section>
    </div>
  );
}
