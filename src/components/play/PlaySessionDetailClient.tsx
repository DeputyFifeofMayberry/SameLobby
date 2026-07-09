"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PostPlayPrompt } from "@/components/play/PostPlayPrompt";
import {
  cancelGamingSession,
  confirmSessionOccurred,
} from "@/domains/play/actions";
import { shouldShowPostPlayPrompt } from "@/domains/play/schemas";
import type { GamingSessionDetail } from "@/domains/play/types";
import {
  GAMING_SESSION_STATUS_LABELS,
} from "@/domains/play/types";
import { formatSessionRange } from "@/domains/play/timezone";

type PlaySessionDetailClientProps = {
  session: GamingSessionDetail;
};

export function PlaySessionDetailClient({ session }: PlaySessionDetailClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { viewerLabel, otherLabel } = formatSessionRange(
    session.confirmed_start_at,
    session.session_length_minutes,
    session.viewerTimeZone,
    session.otherTimeZone,
  );

  const showPostPlay =
    shouldShowPostPlayPrompt(session.status, session.completed_at) &&
    !session.feedbackSubmitted;

  const canConfirm =
    session.status === "confirmed" || session.status === "in_progress";
  const viewerConfirmed = session.viewerOccurred === true;

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/play" className="text-sm text-[var(--color-lobby-teal)] underline">
          ← Play
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
          Play session
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-slate)]">
          With {session.otherDisplayName}
        </p>
      </div>

      <article className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
        <p className="text-sm">
          {session.gameName} · {session.platformName}
        </p>
        <p className="text-sm">{viewerLabel}</p>
        {otherLabel && (
          <p className="text-xs text-[var(--color-text-slate)]">
            Their time: {otherLabel}
          </p>
        )}
        <p className="text-sm">
          Status: {GAMING_SESSION_STATUS_LABELS[session.status]}
        </p>
        {session.viewerOccurred != null && (
          <p className="text-sm text-[var(--color-text-slate)]">
            You confirmed play occurred: {session.viewerOccurred ? "Yes" : "No"}
          </p>
        )}
      </article>

      <p>
        <a
          href={`/api/play/sessions/${session.id}/calendar`}
          className="text-sm text-[var(--color-lobby-teal)] underline"
        >
          Download calendar file (.ics)
        </a>
      </p>

      {error && <Alert variant="error">{error}</Alert>}

      {canConfirm && !viewerConfirmed && (
        <Button
          type="button"
          disabled={pending}
          onClick={() => run(() => confirmSessionOccurred(session.id))}
        >
          Confirm we played
        </Button>
      )}

      {canConfirm && (
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => run(() => cancelGamingSession(session.id))}
        >
          Cancel session
        </Button>
      )}

      {showPostPlay && (
        <PostPlayPrompt sessionId={session.id} otherAccountId={session.otherAccountId} />
      )}
    </div>
  );
}
