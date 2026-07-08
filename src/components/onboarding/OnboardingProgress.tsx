import {
  ONBOARDING_STEP_LABELS,
  REQUIRED_ONBOARDING_STEPS,
} from "@/domains/onboarding/constants";
import type { OnboardingStep } from "@/domains/profile/types";

export function OnboardingProgress({ step }: { step: OnboardingStep }) {
  const index = REQUIRED_ONBOARDING_STEPS.indexOf(
    step === "availability" ? "preview" : step,
  );
  const current = index >= 0 ? index + 1 : REQUIRED_ONBOARDING_STEPS.length;
  const total = REQUIRED_ONBOARDING_STEPS.length;
  const label =
    step === "availability"
      ? ONBOARDING_STEP_LABELS.availability
      : ONBOARDING_STEP_LABELS[step];

  return (
    <p aria-live="polite" className="text-sm text-[var(--color-text-slate)]">
      Step {current} of {total} — {label}
    </p>
  );
}
