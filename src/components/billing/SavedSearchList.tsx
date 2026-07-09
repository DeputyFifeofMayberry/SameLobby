"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { deleteSavedSearch } from "@/domains/discovery/saved-searches-actions";
import type { SavedSearch } from "@/domains/billing/types";

type SavedSearchListProps = {
  searches: SavedSearch[];
};

export function SavedSearchList({ searches }: SavedSearchListProps) {
  const [pending, startTransition] = useTransition();

  if (searches.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-slate)]">
        No saved searches yet. Save filters from{" "}
        <Link href="/discover/search" className="underline">
          Discover search
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {searches.map((search) => {
        const params = new URLSearchParams();
        if (search.filters.q) params.set("q", search.filters.q);
        if (search.filters.gameId) params.set("game", search.filters.gameId);
        if (search.filters.platformId)
          params.set("platform", search.filters.platformId);
        if (search.filters.goal) params.set("goal", search.filters.goal);
        const href = `/discover/search?${params.toString()}`;

        return (
          <li
            key={search.id}
            className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-3 text-sm"
          >
            <Link href={href} className="font-medium hover:underline">
              {search.name}
            </Link>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deleteSavedSearch(search.id);
                })
              }
            >
              Delete
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
