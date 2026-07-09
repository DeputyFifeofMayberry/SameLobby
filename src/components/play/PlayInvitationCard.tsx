import Link from "next/link";
import type { PlayInvitationListItem } from "@/domains/play/types";
import { formatInTimeZone } from "@/domains/play/timezone";

type PlayInvitationCardProps = {
  invitation: PlayInvitationListItem;
  viewerTimeZone: string;
};

export function PlayInvitationCard({
  invitation,
  viewerTimeZone,
}: PlayInvitationCardProps) {
  const expiresLabel = formatInTimeZone(invitation.expiresAt, viewerTimeZone, {
    weekday: undefined,
    hour: undefined,
    minute: undefined,
  });

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
            <Link
              href={`/profile/${invitation.otherAccountId}`}
              className="text-[var(--color-night-navy)] underline-offset-2 hover:underline"
            >
              {invitation.otherDisplayName}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-slate)]">
            {invitation.direction === "incoming" ? "Incoming" : "Outgoing"} ·{" "}
            {invitation.status}
          </p>
          <p className="mt-1 text-sm">
            {invitation.gameName} · {invitation.platformName}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-slate)]">
            {invitation.schedulingMode === "play_now" ? "Play now" : "Scheduled"} ·
            Expires {expiresLabel}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Link
          href={`/play/invitations/${invitation.id}`}
          className="text-sm text-[var(--color-lobby-teal)] underline"
        >
          View invitation
        </Link>
      </div>
    </article>
  );
}
