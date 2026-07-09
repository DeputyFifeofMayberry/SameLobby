import type { Entitlements, SubscriptionRow } from "@/domains/billing/types";

type SubscriptionStatusPanelProps = {
  subscription: SubscriptionRow | null;
  entitlements: Entitlements;
};

export function SubscriptionStatusPanel({
  subscription,
  entitlements,
}: SubscriptionStatusPanelProps) {
  const tierLabel =
    entitlements.tier === "plus" ? "SameLobby Plus" : "SameLobby Free";

  return (
    <section className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
        Current plan
      </h2>
      <p className="text-sm">
        <strong>{tierLabel}</strong>
        {subscription?.status && subscription.status !== "none" && (
          <> · {subscription.status.replace(/_/g, " ")}</>
        )}
      </p>
      {subscription?.current_period_end && entitlements.tier === "plus" && (
        <p className="text-sm text-[var(--color-text-slate)]">
          {subscription.cancel_at_period_end ? "Access until" : "Renews"}{" "}
          {new Date(subscription.current_period_end).toLocaleDateString()}
        </p>
      )}
      {entitlements.readOnly && (
        <p className="text-sm text-[var(--color-error)]">
          Your account is read-only until you resubscribe.
        </p>
      )}
    </section>
  );
}
