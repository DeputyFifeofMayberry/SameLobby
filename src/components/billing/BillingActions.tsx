"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  createCheckoutSession,
  createPortalSession,
} from "@/domains/billing/actions";

type BillingActionsProps = {
  stripeEnabled: boolean;
  hasPlus: boolean;
  canStartCheckout: boolean;
};

export function BillingActions({
  stripeEnabled,
  hasPlus,
  canStartCheckout,
}: BillingActionsProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!stripeEnabled) {
    return (
      <Alert variant="info">Subscriptions are rolling out gradually.</Alert>
    );
  }

  function run(
    action: () => Promise<{ ok: boolean; url?: string; error?: string }>,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  return (
    <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
        Manage billing
      </h2>
      <p className="text-sm text-[var(--color-text-slate)]">
        Confirm your password before starting checkout or opening the billing
        portal.
      </p>
      <label className="block text-sm">
        <span className="font-medium">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
          autoComplete="current-password"
        />
      </label>
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex flex-wrap gap-2">
        {canStartCheckout && (
          <>
            <Button
              type="button"
              disabled={pending}
              onClick={() =>
                run(() => createCheckoutSession("plus_monthly", password))
              }
            >
              Upgrade monthly
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() =>
                run(() => createCheckoutSession("plus_annual", password))
              }
            >
              Upgrade annual
            </Button>
          </>
        )}
        {hasPlus && (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => createPortalSession(password))}
          >
            Manage in Stripe
          </Button>
        )}
      </div>
    </section>
  );
}
