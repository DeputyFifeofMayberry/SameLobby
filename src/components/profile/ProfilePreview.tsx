import {
  COMMUNICATION_MODE_LABELS,
  INTENT_GOAL_LABELS,
  type CommunicationMode,
  type IntentGoal,
} from "@/domains/profile/types";
import { Badge } from "@/components/ui/Badge";
import type { UserGameRow } from "@/domains/games/types";

type ProfilePreviewProps = {
  displayName: string;
  timeZoneLabel: string;
  userGames: UserGameRow[];
  communicationModes: CommunicationMode[];
  goal: IntentGoal | null;
};

export function ProfilePreview({
  displayName,
  timeZoneLabel,
  userGames,
  communicationModes,
  goal,
}: ProfilePreviewProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            {displayName}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-slate)]">
            {timeZoneLabel}
          </p>
        </div>
        <Badge variant="public">Discoverable preview</Badge>
      </div>

      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="font-medium">Games & platforms</dt>
          <dd className="mt-1 text-[var(--color-text-slate)]">
            {userGames.length > 0
              ? userGames
                  .map(
                    (ug) =>
                      `${ug.game?.name ?? "Game"} · ${ug.platform?.name ?? "Platform"}`,
                  )
                  .join(", ")
              : "None yet"}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Communication</dt>
          <dd className="mt-1 text-[var(--color-text-slate)]">
            {communicationModes
              .map((mode) => COMMUNICATION_MODE_LABELS[mode])
              .join(", ") || "None yet"}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Current goal</dt>
          <dd className="mt-1 text-[var(--color-text-slate)]">
            {goal ? INTENT_GOAL_LABELS[goal] : "None yet"}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-xs text-[var(--color-text-slate)]">
        Public fields are shown to eligible SameLobby members. Match-only
        details stay private until needed for compatibility.
      </p>
    </div>
  );
}
