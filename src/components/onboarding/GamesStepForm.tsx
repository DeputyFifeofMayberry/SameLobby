"use client";

import { useActionState } from "react";
import { saveGamesStep, type ActionResult } from "@/domains/profile/actions";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { GamePlatformPickerClient } from "@/components/profile/GamePlatformPickerClient";
import type { Game, Platform } from "@/domains/games/types";

const initial: ActionResult | null = null;

type Props = {
  games: Game[];
  platforms: Platform[];
  gamePlatforms: { game_id: string; platform_id: string }[];
};

export function GamesStepForm({ games, platforms, gamePlatforms }: Props) {
  const [state, formAction, pending] = useActionState(saveGamesStep, initial);

  return (
    <form action={formAction} className="mx-auto max-w-lg space-y-6">
      <GamePlatformPickerClient
        games={games}
        platforms={platforms}
        gamePlatforms={gamePlatforms}
      />
      {state && !state.ok && (
        <Alert variant="error" role="alert">
          {state.error}
        </Alert>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
