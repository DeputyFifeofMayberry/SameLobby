import { GoalStepForm } from "@/components/onboarding/GoalStepForm";

export default function GoalOnboardingPage() {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Your current goal
      </h1>
      <p className="mt-2 text-[var(--color-text-slate)]">
        Helps others understand what you are looking for right now. Expires in 14
        days and can be renewed anytime.
      </p>
      <div className="mt-8">
        <GoalStepForm />
      </div>
    </div>
  );
}
