"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addUserGame,
  removeUserGame,
  renewCurrentIntent,
  type ActionResult,
} from "@/domains/profile/actions";
import { setDiscoveryPaused } from "@/domains/discovery/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { GamePlatformPickerClient } from "@/components/profile/GamePlatformPickerClient";
import { INTENT_GOAL_LABELS, type IntentGoal } from "@/domains/profile/types";
import type { Game, Platform } from "@/domains/games/types";
import type { UserGameRow } from "@/domains/games/types";

const initial: ActionResult | null = null;

type ProfileGamesSectionProps = {
  userGames: UserGameRow[];
  games: Game[];
  platforms: Platform[];
  gamePlatforms: { game_id: string; platform_id: string }[];
  maxActiveGames: number;
  atGameLimit: boolean;
  stripeEnabled: boolean;
  discoveryPaused: boolean;
  currentGoal: IntentGoal | null;
  intentExpiresAt: string | null;
  currentTimeMs: number;
};

export function ProfileGamesSection({
  userGames,
  games,
  platforms,
  gamePlatforms,
  maxActiveGames,
  atGameLimit,
  stripeEnabled,
  discoveryPaused,
  currentGoal,
  intentExpiresAt,
  currentTimeMs,
}: ProfileGamesSectionProps) {
  const [addState, addAction, addPending] = useActionState(
    addUserGame,
    initial,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeUserGame,
    initial,
  );
  const [pausePending, startPauseTransition] = useTransition();
  const [renewPending, startRenewTransition] = useTransition();
  const [renewError, setRenewError] = useState<string | null>(null);
  const [renewOk, setRenewOk] = useState(false);

  const existingGameIds = new Set(userGames.map((ug) => ug.game_id));
  const availableGames = games.filter((g) => !existingGameIds.has(g.id));

  const expiresSoon =
    intentExpiresAt &&
    new Date(intentExpiresAt).getTime() - currentTimeMs <
      3 * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      <ul className="space-y-2">
        {userGames.map((ug) => (
          <li
            key={ug.id}
            className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
          >
            <div>
              <p className="font-medium">{ug.game?.name ?? "Game"}</p>
              <p className="text-sm text-[var(--color-text-slate)]">
                {ug.platform?.name ?? "Platform"}
              </p>
            </div>
            <form action={removeAction}>
              <input type="hidden" name="userGameId" value={ug.id} />
              <Button
                type="submit"
                variant="ghost"
                disabled={removePending || userGames.length <= 1}
              >
                Remove
              </Button>
            </form>
          </li>
        ))}
      </ul>

      {removeState && !removeState.ok && (
        <Alert variant="error" role="alert" aria-live="assertive">
          {removeState.error}
        </Alert>
      )}

      {!atGameLimit && availableGames.length > 0 && (
        <form
          action={addAction}
          className="space-y-4 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-4"
        >
          <p className="text-sm font-medium">Add a game</p>
          <GamePlatformPickerClient
            games={availableGames}
            platforms={platforms}
            gamePlatforms={gamePlatforms}
          />
          {addState && !addState.ok && (
            <Alert variant="error" role="alert" aria-live="assertive">
              {addState.error}
            </Alert>
          )}
          <Button type="submit" disabled={addPending}>
            {addPending ? "Adding…" : "Add game"}
          </Button>
        </form>
      )}

      <p className="text-xs text-[var(--color-text-slate)]">
        {userGames.length} of {maxActiveGames} active games
        {atGameLimit && stripeEnabled && (
          <>
            {" "}
            ·{" "}
            <a href="/subscription" className="underline">
              View plans
            </a>
          </>
        )}
      </p>

      <div className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4">
        <div>
          <p className="text-sm font-medium">Discovery visibility</p>
          <p className="text-sm text-[var(--color-text-slate)]">
            {discoveryPaused
              ? "You are hidden from recommendations and search."
              : "You appear in recommendations when eligible."}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={pausePending}
          onClick={() => {
            startPauseTransition(async () => {
              await setDiscoveryPaused(!discoveryPaused);
            });
          }}
        >
          {pausePending
            ? "Saving…"
            : discoveryPaused
              ? "Resume discovery"
              : "Pause discovery"}
        </Button>
      </div>

      {currentGoal && intentExpiresAt && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
          <p className="text-sm font-medium">Current intent</p>
          <p className="mt-1">{INTENT_GOAL_LABELS[currentGoal]}</p>
          <p className="mt-1 text-sm text-[var(--color-text-slate)]">
            Expires{" "}
            {new Date(intentExpiresAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </p>
          {(expiresSoon || renewOk) && (
            <div className="mt-3">
              {renewOk ? (
                <Alert variant="success" role="status" aria-live="polite">
                  Intent renewed for 14 days.
                </Alert>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={renewPending}
                  onClick={() => {
                    setRenewError(null);
                    startRenewTransition(async () => {
                      const result = await renewCurrentIntent();
                      if (!result.ok) {
                        setRenewError(result.error);
                        return;
                      }
                      setRenewOk(true);
                    });
                  }}
                >
                  {renewPending ? "Renewing…" : "Renew intent"}
                </Button>
              )}
              {renewError && (
                <Alert
                  variant="error"
                  role="alert"
                  aria-live="assertive"
                  className="mt-2"
                >
                  {renewError}
                </Alert>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
