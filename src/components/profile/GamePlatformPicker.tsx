import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import type { Game, Platform } from "@/domains/games/types";

type GamePlatformPickerProps = {
  games: Game[];
  platforms: Platform[];
  gamePlatforms: { game_id: string; platform_id: string }[];
  defaultGameId?: string;
  defaultPlatformId?: string;
};

export function GamePlatformPicker({
  games,
  platforms,
  gamePlatforms,
  defaultGameId,
  defaultPlatformId,
}: GamePlatformPickerProps) {
  const platformIdsForGame = (gameId: string) =>
    new Set(
      gamePlatforms
        .filter((gp) => gp.game_id === gameId)
        .map((gp) => gp.platform_id),
    );

  const availablePlatforms = defaultGameId
    ? platforms.filter((p) => platformIdsForGame(defaultGameId).has(p.id))
    : platforms;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="gameId">First game</Label>
        <Select
          id="gameId"
          name="gameId"
          required
          defaultValue={defaultGameId ?? ""}
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
          defaultValue={defaultPlatformId ?? ""}
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
