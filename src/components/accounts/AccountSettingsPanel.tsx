"use client";

import { useActionState } from "react";
import {
  confirmAccountDeletion,
  requestAccountDeletion,
  signOut,
  type ActionResult,
} from "@/domains/accounts/actions";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Label } from "@/components/ui/Label";
import type { Account } from "@/domains/accounts/types";

const initial: ActionResult | null = null;

type AccountSettingsPanelProps = {
  account: Account;
  deletionStatus: string | null;
};

export function AccountSettingsPanel({
  account,
  deletionStatus,
}: AccountSettingsPanelProps) {
  const [state, formAction, pending] = useActionState(
    requestAccountDeletion,
    initial,
  );
  const [confirmState, confirmAction, confirmFormPending] = useActionState(
    confirmAccountDeletion,
    initial,
  );

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="mt-2 text-sm text-[var(--color-text-slate)]">
          Status: <strong>{account.status}</strong>
        </p>
        {deletionStatus && (
          <p className="mt-1 text-sm text-[var(--color-text-slate)]">
            Deletion request: <strong>{deletionStatus}</strong>
          </p>
        )}
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
          block records may be retained as described in the Privacy Notice.
          Automated jobs process confirmed deletion requests on a schedule.
        </p>
        {state?.ok && (
          <Alert variant="success" className="mt-4">
            Deletion requested. Confirm below to schedule processing.
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
        {deletionStatus === "requested" && (
          <form action={confirmAction} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="confirm-deletion-password">Password</Label>
              <input
                id="confirm-deletion-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
              />
            </div>
            {confirmState && !confirmState.ok && (
              <Alert variant="error" role="alert">
                {confirmState.error}
              </Alert>
            )}
            {confirmState?.ok && (
              <Alert variant="success" role="status">
                Deletion confirmed. Processing will run on the scheduled job.
              </Alert>
            )}
            <Button type="submit" variant="secondary" disabled={confirmFormPending}>
              {confirmFormPending ? "Confirming…" : "Confirm deletion schedule (re-auth)"}
            </Button>
            <p className="text-xs text-[var(--color-text-slate)]">
              Re-enter your password to schedule automated processing.
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
