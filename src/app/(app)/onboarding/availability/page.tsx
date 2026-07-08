import { AvailabilityStepForm } from "@/components/onboarding/AvailabilityStepForm";

export default function AvailabilityOnboardingPage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        General availability
      </h1>
      <p className="mt-2 text-[var(--color-text-slate)]">
        Optional step — skip if you are not sure yet.
      </p>
      <div className="mt-8">
        <AvailabilityStepForm />
      </div>
    </div>
  );
}
