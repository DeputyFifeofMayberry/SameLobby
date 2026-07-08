import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  INTENT_GOAL_LABELS,
  type IntentGoal,
} from "@/domains/profile/types";

type RecommendationCardProps = {
  accountId: string;
  displayName: string;
  goal: IntentGoal;
  reasonLabels: string[];
};

export function RecommendationCard({
  accountId,
  displayName,
  goal,
  reasonLabels,
}: RecommendationCardProps) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
            {displayName}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-slate)]">
            {INTENT_GOAL_LABELS[goal]}
          </p>
        </div>
        <Link
          href={`/profile/${accountId}`}
          className="text-sm font-medium text-[var(--color-lobby-teal)] underline"
        >
          View profile
        </Link>
      </div>
      {reasonLabels.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {reasonLabels.map((label) => (
            <li key={label}>
              <Badge variant="match">{label}</Badge>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
