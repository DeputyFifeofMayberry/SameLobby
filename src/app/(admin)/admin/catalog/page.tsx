import { notFound } from "next/navigation";
import { CatalogGameRowActions } from "@/components/admin/CatalogGameRowActions";
import {
  getCatalogStats,
  listCatalogGames,
  listCatalogPlatforms,
} from "@/domains/admin/catalog-queries";
import { requireAdmin } from "@/domains/admin/permissions";

export default async function AdminCatalogPage() {
  const ctx = await requireAdmin("catalog");
  if (!ctx.ok) notFound();

  const [games, stats, platforms] = await Promise.all([
    listCatalogGames(),
    getCatalogStats(),
    listCatalogPlatforms(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Games catalog
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-slate)]">
          {stats.activeGames} active · {stats.anchorGames} anchors ·{" "}
          {stats.totalGames} total
        </p>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left">
              <th className="px-4 py-3 font-medium">Game</th>
              <th className="px-4 py-3 font-medium">Platforms</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr
                key={game.id}
                className="border-b border-[var(--color-border)] last:border-0"
              >
                <td className="px-4 py-3">
                  <p className="font-medium">{game.name}</p>
                  <p className="text-xs text-[var(--color-text-slate)]">
                    {game.slug}
                    {game.isAnchor ? " · anchor" : ""}
                  </p>
                </td>
                <td className="px-4 py-3">{game.platformCount}</td>
                <td className="px-4 py-3">
                  {game.isActive ? "Active" : "Inactive"}
                  {game.crossplayReviewedAt && (
                    <p className="text-xs text-[var(--color-text-slate)]">
                      Crossplay reviewed
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <CatalogGameRowActions game={game} platforms={platforms} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
