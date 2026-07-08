import Link from "next/link";
import { redirect } from "next/navigation";
import { CurrentIntentCard } from "@/components/discover/CurrentIntentCard";
import { DensityEmptyState } from "@/components/discover/DensityEmptyState";
import { DiscoverFilterPanel } from "@/components/discover/DiscoverFilterPanel";
import { DiscoverPauseControl } from "@/components/discover/DiscoverPauseControl";
import { RecommendationCard } from "@/components/discover/RecommendationCard";
import { Alert } from "@/components/ui/Alert";
import { requireAccount } from "@/domains/accounts/queries";
import {
  getActiveRecommendations,
  getCohortSnapshot,
  isDiscoveryPaused,
  refreshRecommendations,
} from "@/domains/discovery/queries";
import { getCurrentIntent, getGamerProfileForAccount } from "@/domains/profile/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { MAX_RECOMMENDATIONS } from "@/domains/discovery/constants";

export default async function DiscoverPage() {
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const discoveryEnabled = await isFeatureEnabled("discovery_enabled");

  const [currentIntent, paused, cohort] = await Promise.all([
    getCurrentIntent(account.id),
    isDiscoveryPaused(account.id),
    discoveryEnabled ? getCohortSnapshot(account.id) : Promise.resolve(null),
  ]);

  let recommendations =
    discoveryEnabled && cohort?.status === "active_discovery"
      ? await getActiveRecommendations(account.id)
      : [];

  if (
    discoveryEnabled &&
    cohort?.status === "active_discovery" &&
    recommendations.length === 0
  ) {
    await refreshRecommendations(account.id);
    recommendations = await getActiveRecommendations(account.id);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Discover
          </h1>
          <p className="mt-2 text-[var(--color-text-slate)]">
            Players who match your games, goals, and schedule.
          </p>
        </div>
        <Link
          href="/discover/search"
          className="text-sm text-[var(--color-lobby-teal)] underline"
        >
          Search
        </Link>
      </div>

      {!discoveryEnabled && (
        <Alert variant="info">
          Discovery is rolling out gradually. Your profile is ready — check back
          soon.
        </Alert>
      )}

      {currentIntent && (
        <CurrentIntentCard
          goal={currentIntent.goal}
          expiresAt={currentIntent.expires_at}
          paused={paused}
        />
      )}

      {discoveryEnabled && <DiscoverPauseControl paused={paused} />}

      {discoveryEnabled && cohort && cohort.status !== "active_discovery" && (
        <DensityEmptyState
          qualifiedCount={cohort.qualifiedCount}
          hasDemandSignal={cohort.hasDemandSignal}
          status={
            cohort.status === "demand_collecting"
              ? "demand_collecting"
              : "below_threshold"
          }
        />
      )}

      {discoveryEnabled && cohort?.status === "active_discovery" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              Today&apos;s recommendations
            </h2>
            <span className="text-sm text-[var(--color-text-slate)]">
              Up to {MAX_RECOMMENDATIONS}
            </span>
          </div>
          {recommendations.length === 0 ? (
            <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-slate)]">
              No eligible players right now. Try search or check back after more
              players join your cohort.
            </p>
          ) : (
            <ul className="space-y-4">
              {recommendations.map((rec) => (
                <li key={rec.recommendationId}>
                  <RecommendationCard
                    accountId={rec.accountId}
                    displayName={rec.displayName}
                    goal={rec.goal}
                    reasonLabels={rec.reasonLabels}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {discoveryEnabled && <DiscoverFilterPanel />}
    </div>
  );
}
