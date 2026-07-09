import Link from "next/link";
import { BillingActions } from "@/components/billing/BillingActions";
import { PlanComparisonTable } from "@/components/billing/PlanComparisonTable";
import { SavedSearchList } from "@/components/billing/SavedSearchList";
import { SubscriptionStatusPanel } from "@/components/billing/SubscriptionStatusPanel";
import { UsageMeter } from "@/components/billing/UsageMeter";
import { Alert } from "@/components/ui/Alert";
import { requireAccount } from "@/domains/accounts/queries";
import { getEntitlements } from "@/domains/billing/entitlements";
import {
  countActiveGamesForAccount,
  countOwnedGroupsFormingOrActive,
  getSubscriptionForAccount,
  listSavedSearches,
} from "@/domains/billing/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

type SubscriptionPageProps = {
  searchParams: Promise<{
    checkout?: string;
    error?: string;
  }>;
};

export default async function SubscriptionPage({
  searchParams,
}: SubscriptionPageProps) {
  const account = await requireAccount();
  const params = await searchParams;

  const [
    entitlements,
    subscription,
    activeGames,
    ownedGroups,
    savedSearches,
    stripeEnabled,
  ] = await Promise.all([
    getEntitlements(account.id),
    getSubscriptionForAccount(account.id),
    countActiveGamesForAccount(account.id),
    countOwnedGroupsFormingOrActive(account.id),
    listSavedSearches(account.id),
    isFeatureEnabled("stripe_enabled"),
  ]);

  const hasPlus = entitlements.tier === "plus";
  const canStartCheckout =
    stripeEnabled &&
    account.status === "active" &&
    !hasPlus &&
    !entitlements.readOnly;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Subscription
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-slate)]">
          Plus adds organization tools — not visibility, ranking, or safety
          features.{" "}
          <Link href="/pricing" className="underline">
            Compare plans
          </Link>
        </p>
      </div>

      {params.checkout === "success" && (
        <Alert variant="success">
          Checkout complete. Your plan will update shortly after payment
          confirms.
        </Alert>
      )}
      {params.checkout === "cancel" && (
        <Alert variant="info">Checkout was canceled.</Alert>
      )}
      {params.error && (
        <Alert variant="error">{decodeURIComponent(params.error)}</Alert>
      )}

      <SubscriptionStatusPanel
        subscription={subscription}
        entitlements={entitlements}
      />
      <UsageMeter
        entitlements={entitlements}
        activeGames={activeGames}
        ownedGroups={ownedGroups}
        savedSearchCount={savedSearches.length}
      />
      <BillingActions
        stripeEnabled={stripeEnabled}
        hasPlus={hasPlus}
        canStartCheckout={canStartCheckout}
      />
      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Saved searches
        </h2>
        <SavedSearchList searches={savedSearches} />
      </section>
      <PlanComparisonTable />
    </div>
  );
}
