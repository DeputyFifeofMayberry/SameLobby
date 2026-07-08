import type { OnboardingStep } from "@/domains/profile/types";

export const ONBOARDING_STEP_ROUTES: Record<OnboardingStep, string> = {
  identity: "/onboarding/identity",
  games: "/onboarding/games",
  communication: "/onboarding/communication",
  goal: "/onboarding/goal",
  availability: "/onboarding/availability",
  preview: "/onboarding/preview",
};

export const REQUIRED_ONBOARDING_STEPS: OnboardingStep[] = [
  "identity",
  "games",
  "communication",
  "goal",
  "preview",
];

export const ONBOARDING_STEP_LABELS: Record<OnboardingStep, string> = {
  identity: "Display name and time zone",
  games: "First game and platform",
  communication: "Communication capability",
  goal: "Current goal",
  availability: "General availability",
  preview: "Profile preview",
};

export function onboardingStepPath(step: OnboardingStep): string {
  return ONBOARDING_STEP_ROUTES[step];
}

export function firstIncompleteOnboardingPath(
  step: OnboardingStep,
): string {
  return onboardingStepPath(step);
}
