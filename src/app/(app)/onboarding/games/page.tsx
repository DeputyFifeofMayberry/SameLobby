import { GamesStepForm } from "@/components/onboarding/GamesStepForm";
import {
  listGamePlatforms,
  listGames,
  listPlatforms,
} from "@/domains/games/queries";

export default async function GamesOnboardingPage() {
  const [games, platforms, gamePlatforms] = await Promise.all([
    listGames(),
    listPlatforms(),
    listGamePlatforms(),
  ]);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Your first game
      </h1>
      <p className="mt-2 text-[var(--color-text-slate)]">
        Pick a game and the platform you play on. You can add more later.
      </p>
      <div className="mt-8">
        <GamesStepForm
          games={games}
          platforms={platforms}
          gamePlatforms={gamePlatforms}
        />
      </div>
    </div>
  );
}
