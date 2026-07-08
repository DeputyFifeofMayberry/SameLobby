import { COHORT_MIN_QUALIFIED } from "@/domains/discovery/constants";
import { DemandOptInForm } from "@/components/discover/DemandOptInForm";

type DensityEmptyStateProps = {
  qualifiedCount: number;
  hasDemandSignal: boolean;
  status: "below_threshold" | "demand_collecting";
};

export function DensityEmptyState({
  qualifiedCount,
  hasDemandSignal,
  status,
}: DensityEmptyStateProps) {
  const remaining = Math.max(0, COHORT_MIN_QUALIFIED - qualifiedCount);

  return (
    <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-white p-8 text-center">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
        Building your lobby
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-[var(--color-text-slate)]">
        Discovery opens when at least {COHORT_MIN_QUALIFIED} qualified players are
        in your cohort. Right now there are {qualifiedCount} — about {remaining}{" "}
        more needed.
      </p>
      {status === "demand_collecting" || hasDemandSignal ? (
        <p className="mt-4 text-sm font-medium text-[var(--color-lobby-teal)]">
          You&apos;re on the list. We&apos;ll notify you when your cohort activates.
        </p>
      ) : (
        <div className="mt-6">
          <DemandOptInForm />
        </div>
      )}
    </section>
  );
}
