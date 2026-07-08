import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  INTENT_GOAL_LABELS,
  type IntentGoal,
} from "@/domains/profile/types";

type CurrentIntentCardProps = {
  goal: IntentGoal;
  expiresAt: string;
  paused: boolean;
};

export function CurrentIntentCard({
  goal,
  expiresAt,
  paused,
}: CurrentIntentCardProps) {
  const expiresLabel = new Date(expiresAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-slate)]">
            Your current intent
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold">
            {INTENT_GOAL_LABELS[goal]}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-slate)]">
            Refreshes by {expiresLabel}
          </p>
        </div>
        <Badge variant={paused ? "neutral" : "public"}>
          {paused ? "Paused" : "Active"}
        </Badge>
      </div>
      <p className="mt-4 text-sm">
        <Link href="/profile" className="text-[var(--color-lobby-teal)] underline">
          Edit intent on profile
        </Link>
      </p>
    </section>
  );
}
