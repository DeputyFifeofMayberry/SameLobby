import Link from "next/link";
import { listGames, listPlatforms } from "@/domains/games/queries";
import { INTENT_GOALS, INTENT_GOAL_LABELS } from "@/domains/profile/types";
import { DiscoverSearchForm } from "@/components/discover/DiscoverSearchForm";

export async function DiscoverFilterPanel() {
  const [games, platforms] = await Promise.all([listGames(), listPlatforms()]);

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Search players
        </h2>
        <Link
          href="/discover/search"
          className="text-sm text-[var(--color-lobby-teal)] underline"
        >
          Advanced search
        </Link>
      </div>
      <DiscoverSearchForm
        games={games.map((g) => ({ id: g.id, name: g.name }))}
        platforms={platforms.map((p) => ({ id: p.id, name: p.name }))}
        goals={INTENT_GOALS.map((goal) => ({
          value: goal,
          label: INTENT_GOAL_LABELS[goal],
        }))}
      />
    </section>
  );
}
