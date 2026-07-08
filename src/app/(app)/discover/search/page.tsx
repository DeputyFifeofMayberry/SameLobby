import Link from "next/link";
import { redirect } from "next/navigation";
import { RecommendationCard } from "@/components/discover/RecommendationCard";
import { DiscoverSearchForm } from "@/components/discover/DiscoverSearchForm";
import { requireAccount } from "@/domains/accounts/queries";
import { searchDiscoverableProfiles } from "@/domains/discovery/queries";
import { listGames, listPlatforms } from "@/domains/games/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { INTENT_GOALS, INTENT_GOAL_LABELS, type IntentGoal } from "@/domains/profile/types";
import { isFeatureEnabled } from "@/lib/feature-flags";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    game?: string;
    platform?: string;
    goal?: string;
  }>;
};

export default async function DiscoverSearchPage({ searchParams }: SearchPageProps) {
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const discoveryEnabled = await isFeatureEnabled("discovery_enabled");
  if (!discoveryEnabled) {
    redirect("/discover");
  }

  const params = await searchParams;
  const [games, platforms] = await Promise.all([listGames(), listPlatforms()]);

  const goalParam = params.goal;
  const validGoal =
    goalParam && INTENT_GOALS.includes(goalParam as IntentGoal)
      ? (goalParam as IntentGoal)
      : undefined;

  const hasFilters = Boolean(
    params.q || params.game || params.platform || validGoal,
  );

  const results = hasFilters
    ? await searchDiscoverableProfiles(account.id, {
        query: params.q,
        gameId: params.game,
        platformId: params.platform,
        goal: validGoal,
      })
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/discover" className="text-sm text-[var(--color-lobby-teal)] underline">
          ← Back to discover
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold">
          Search players
        </h1>
      </div>

      <DiscoverSearchForm
        games={games.map((g) => ({ id: g.id, name: g.name }))}
        platforms={platforms.map((p) => ({ id: p.id, name: p.name }))}
        goals={INTENT_GOALS.map((goal) => ({
          value: goal,
          label: INTENT_GOAL_LABELS[goal],
        }))}
      />

      {hasFilters && (
        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
            Results ({results.length})
          </h2>
          {results.length === 0 ? (
            <p className="text-sm text-[var(--color-text-slate)]">
              No eligible players match your filters.
            </p>
          ) : (
            <ul className="space-y-4">
              {results.map((rec) => (
                <li key={rec.accountId}>
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
    </div>
  );
}
