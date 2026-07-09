import Link from "next/link";
import type { GamingSessionListItem } from "@/domains/play/types";
import { GAMING_SESSION_STATUS_LABELS } from "@/domains/play/types";
import { formatSessionRange } from "@/domains/play/timezone";

type PlaySessionCardProps = {
  session: GamingSessionListItem;
};

export function PlaySessionCard({ session }: PlaySessionCardProps) {
  const { viewerLabel, otherLabel } = formatSessionRange(
    session.confirmedStartAt,
    session.sessionLengthMinutes,
    session.viewerTimeZone,
    session.otherTimeZone,
  );

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
          <Link
            href={`/profile/${session.otherAccountId}`}
            className="text-[var(--color-night-navy)] underline-offset-2 hover:underline"
          >
            {session.otherDisplayName}
          </Link>
        </h3>
        <p className="mt-1 text-sm">
          {session.gameName} · {session.platformName}
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-slate)]">{viewerLabel}</p>
        {otherLabel && (
          <p className="mt-1 text-xs text-[var(--color-text-slate)]">
            Their time: {otherLabel}
          </p>
        )}
        <p className="mt-2 text-sm">
          Status: {GAMING_SESSION_STATUS_LABELS[session.status]}
        </p>
      </div>
      <div className="mt-4">
        <Link
          href={`/play/sessions/${session.id}`}
          className="text-sm text-[var(--color-lobby-teal)] underline"
        >
          View session
        </Link>
      </div>
    </article>
  );
}
