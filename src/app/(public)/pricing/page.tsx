import { PlanComparisonTable } from "@/components/billing/PlanComparisonTable";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          SameLobby Free vs Plus
        </h1>
        <p className="mt-3 text-[var(--color-text-slate)]">
          Plus adds organization and continuity tools — not visibility, ranking,
          or safety features.
        </p>
      </div>
      <PlanComparisonTable />
      <p className="text-sm text-[var(--color-text-slate)]">
        <strong>$8.99/mo</strong> or <strong>$69/yr</strong> via Stripe-hosted
        checkout.
      </p>
    </div>
  );
}
