import type { Entitlements } from "@/domains/billing/types";

type UsageMeterProps = {
  entitlements: Entitlements;
  activeGames: number;
  ownedGroups: number;
  savedSearchCount: number;
};

export function UsageMeter({
  entitlements,
  activeGames,
  ownedGroups,
  savedSearchCount,
}: UsageMeterProps) {
  const rows = [
    {
      label: "Active games",
      used: activeGames,
      max: entitlements.maxActiveGames,
    },
    {
      label: "Groups you own",
      used: ownedGroups,
      max: entitlements.maxActiveGroupsOwned,
    },
    {
      label: "Saved searches",
      used: savedSearchCount,
      max: entitlements.maxSavedSearches,
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
        Usage
      </h2>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-3 text-sm"
          >
            <span>{row.label}</span>
            <span>
              {row.used} / {row.max}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
