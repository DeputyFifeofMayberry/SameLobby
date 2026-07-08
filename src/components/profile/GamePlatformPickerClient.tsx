"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import type { Game, Platform } from "@/domains/games/types";

type Props = {
  games: Game[];
  platforms: Platform[];
  gamePlatforms: { game_id: string; platform_id: string }[];
  defaultGameId?: string;
  defaultPlatformId?: string;
};

export function GamePlatformPickerClient({
  games,
  platforms,
  gamePlatforms,
  defaultGameId = "",
  defaultPlatformId = "",
}: Props) {
  const [gameId, setGameId] = useState(defaultGameId);

  const availablePlatforms = useMemo(() => {
    if (!gameId) return platforms;
    const allowed = new Set(
      gamePlatforms
        .filter((gp) => gp.game_id === gameId)
        .map((gp) => gp.platform_id),
    );
    return platforms.filter((p) => allowed.has(p.id));
  }, [gameId, gamePlatforms, platforms]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="gameId">First game</Label>
        <Select
          id="gameId"
          name="gameId"
          required
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        >
          <option value="" disabled>
            Select a game
          </option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="platformId">Playable platform</Label>
        <Select
          id="platformId"
          name="platformId"
          required
          defaultValue={defaultPlatformId}
          key={gameId}
        >
          <option value="" disabled>
            Select a platform
          </option>
          {availablePlatforms.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.name}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-[var(--color-text-slate)]">
          Cross-play details appear for anchor games after selection.
        </p>
      </div>
    </div>
  );
}
