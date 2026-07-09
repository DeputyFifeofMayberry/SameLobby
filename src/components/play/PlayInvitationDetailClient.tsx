"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  acceptPlayInvitation,
  cancelPlayInvitation,
  declinePlayInvitation,
} from "@/domains/play/actions";
import type { PlayInvitationDetail } from "@/domains/play/types";
import { formatInTimeZone } from "@/domains/play/timezone";

type PlayInvitationDetailClientProps = {
  invitation: PlayInvitationDetail;
  viewerTimeZone: string;
};

export function PlayInvitationDetailClient({
  invitation,
  viewerTimeZone,
}: PlayInvitationDetailClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeOptionId, setSelectedTimeOptionId] = useState(
    invitation.timeOptions[0]?.id ?? "",
  );

  function run(action: () => Promise<{ ok: boolean; error?: string; sessionId?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (result.sessionId) {
        router.push(`/play/sessions/${result.sessionId}`);
      } else {
        router.refresh();
      }
    });
  }

  const isPending = invitation.status === "proposed";
  const canRespond = invitation.viewerIsRecipient && isPending;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/play" className="text-sm text-[var(--color-lobby-teal)] underline">
          ← Play
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
          Play invitation
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-slate)]">
          {invitation.viewerIsRecipient ? "From" : "To"}{" "}
          {invitation.viewerIsRecipient
            ? invitation.proposerDisplayName
            : invitation.recipientDisplayName}
        </p>
      </div>

      <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 space-y-3">
        <p className="text-sm">
          <span className="font-medium">Game:</span> {invitation.gameName} ·{" "}
          {invitation.platformName}
        </p>
        <p className="text-sm">
          <span className="font-medium">When:</span>{" "}
          {invitation.scheduling_mode === "play_now"
            ? "Play now"
            : "Pick a time"}
        </p>
        <p className="text-sm">
          <span className="font-medium">Length:</span> ~
          {invitation.session_length_minutes} minutes
        </p>
        {invitation.voice_preferred && (
          <p className="text-sm">Voice chat preferred</p>
        )}
        {invitation.note && (
          <p className="rounded-[var(--radius-md)] bg-[var(--color-cloud)] p-3 text-sm">
            {invitation.note}
          </p>
        )}
        <p className="text-xs text-[var(--color-text-slate)]">
          Status: {invitation.status} · Expires{" "}
          {formatInTimeZone(invitation.expires_at, viewerTimeZone)}
        </p>
      </article>

      {invitation.scheduling_mode === "scheduled" &&
        invitation.timeOptions.length > 0 && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Proposed times (your time zone)</legend>
            {invitation.timeOptions.map((option) => (
              <label
                key={option.id}
                className="flex min-h-[var(--touch-min)] cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="timeOption"
                  value={option.id}
                  checked={selectedTimeOptionId === option.id}
                  onChange={() => setSelectedTimeOptionId(option.id)}
                  disabled={!canRespond}
                />
                {formatInTimeZone(option.proposed_start_at, viewerTimeZone)}
              </label>
            ))}
          </fieldset>
        )}

      {error && <Alert variant="error">{error}</Alert>}

      {canRespond && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pending}
            onClick={() =>
              run(() =>
                acceptPlayInvitation(
                  invitation.id,
                  invitation.scheduling_mode === "scheduled"
                    ? selectedTimeOptionId
                    : null,
                ),
              )
            }
          >
            Accept
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => declinePlayInvitation(invitation.id))}
          >
            Decline
          </Button>
        </div>
      )}

      {!invitation.viewerIsRecipient && isPending && (
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => run(() => cancelPlayInvitation(invitation.id))}
        >
          Cancel invitation
        </Button>
      )}

      {invitation.sessionId && (
        <p className="text-sm">
          <Link
            href={`/play/sessions/${invitation.sessionId}`}
            className="text-[var(--color-lobby-teal)] underline"
          >
            View confirmed session
          </Link>
        </p>
      )}
    </div>
  );
}
