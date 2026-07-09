"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  markCrossplayReviewed,
  toggleCatalogGameActive,
  updateCatalogGamePlatforms,
} from "@/domains/admin/catalog-actions";
import type {
  CatalogGameRow,
  CatalogPlatform,
} from "@/domains/admin/catalog-queries";

export function CatalogGameRowActions({
  game,
  platforms,
}: {
  game: CatalogGameRow;
  platforms: CatalogPlatform[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingPlatforms, setEditingPlatforms] = useState(false);
  const [selectedPlatformIds, setSelectedPlatformIds] = useState(
    () => new Set(game.platformIds),
  );
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await toggleCatalogGameActive(
                game.id,
                !game.isActive,
              );
              if (!result.ok) setError(result.error);
            });
          }}
        >
          {game.isActive ? "Deactivate" : "Activate"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => setEditingPlatforms((value) => !value)}
        >
          {editingPlatforms ? "Cancel platform edit" : "Edit platforms"}
        </Button>
        {game.isAnchor && (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await markCrossplayReviewed(game.id);
                if (!result.ok) setError(result.error);
              });
            }}
          >
            Mark crossplay reviewed
          </Button>
        )}
      </div>

      {editingPlatforms && (
        <form
          className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            startTransition(async () => {
              const result = await updateCatalogGamePlatforms(game.id, [
                ...selectedPlatformIds,
              ]);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setEditingPlatforms(false);
              router.refresh();
            });
          }}
        >
          <fieldset className="space-y-1">
            <legend className="text-xs font-medium">Playable platforms</legend>
            {platforms.map((platform) => (
              <label
                key={platform.id}
                className="flex min-h-[var(--touch-min)] items-center gap-2 text-xs"
              >
                <input
                  type="checkbox"
                  checked={selectedPlatformIds.has(platform.id)}
                  onChange={(event) => {
                    setSelectedPlatformIds((current) => {
                      const next = new Set(current);
                      if (event.target.checked) next.add(platform.id);
                      else next.delete(platform.id);
                      return next;
                    });
                  }}
                />
                {platform.name}
              </label>
            ))}
          </fieldset>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save platforms"}
          </Button>
        </form>
      )}

      {error && (
        <Alert variant="error" role="alert" aria-live="assertive">
          {error}
        </Alert>
      )}
    </div>
  );
}
