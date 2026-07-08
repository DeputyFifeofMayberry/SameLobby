import type { IntentGoal } from "@/domains/profile/types";
import { INTENT_GOAL_LABELS } from "@/domains/profile/types";

type IcebreakerInput = {
  sharedGames: { gameName: string; platformName: string }[];
  goal: IntentGoal | null;
};

export function buildIcebreakers(input: IcebreakerInput): string[] {
  const suggestions: string[] = [];
  const primaryGame = input.sharedGames[0];

  if (primaryGame) {
    suggestions.push(
      `What ${primaryGame.gameName} modes are you into on ${primaryGame.platformName}?`,
    );
    suggestions.push(`Want to squad up for ${primaryGame.gameName} this week?`);
  } else {
    suggestions.push("What are you playing lately?");
  }

  if (input.goal) {
    suggestions.push(
      `I'm looking for ${INTENT_GOAL_LABELS[input.goal].toLowerCase()} — same for you?`,
    );
  } else {
    suggestions.push("What times usually work for you to play?");
  }

  return suggestions.slice(0, 3);
}
