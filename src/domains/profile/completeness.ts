import type { Account } from "@/domains/accounts/types";
import type { GamerProfile, CurrentIntent } from "@/domains/profile/types";
import type { UserGameRow } from "@/domains/games/types";

export type ProfileCompletenessInput = {
  account: Pick<Account, "time_zone">;
  profile: Pick<
    GamerProfile,
    "display_name" | "communication_modes" | "onboarding_completed_at"
  > | null;
  userGames: Pick<UserGameRow, "id">[];
  currentIntent: Pick<CurrentIntent, "goal"> | null;
};

export function isProfileComplete(input: ProfileCompletenessInput): boolean {
  if (input.profile?.onboarding_completed_at) {
    return true;
  }

  return (
    Boolean(input.profile?.display_name?.trim()) &&
    Boolean(input.account.time_zone) &&
    input.userGames.length >= 1 &&
    (input.profile?.communication_modes.length ?? 0) >= 1 &&
    Boolean(input.currentIntent?.goal)
  );
}

export function profileCompletenessErrors(
  input: ProfileCompletenessInput,
): string[] {
  const errors: string[] = [];
  if (!input.profile?.display_name?.trim()) {
    errors.push("Display name is required.");
  }
  if (!input.account.time_zone) {
    errors.push("Time zone is required.");
  }
  if (input.userGames.length < 1) {
    errors.push("Add at least one game and platform.");
  }
  if ((input.profile?.communication_modes.length ?? 0) < 1) {
    errors.push("Choose at least one communication mode.");
  }
  if (!input.currentIntent?.goal) {
    errors.push("Select a current goal.");
  }
  return errors;
}
