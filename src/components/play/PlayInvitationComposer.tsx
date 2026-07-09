"use client";

import { useActionState, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  proposePlayInvitation,
  type ActionResult,
} from "@/domains/play/actions";
import {
  MAX_TIME_SLOTS,
  SESSION_LENGTH_LABELS,
  SESSION_LENGTH_OPTIONS,
} from "@/domains/play/constants";
import type { SharedGameOption } from "@/domains/play/types";

type PlayInvitationComposerProps = {
  conversationId: string;
  recipientAccountId: string;
  recipientDisplayName: string;
  sharedGames: SharedGameOption[];
  onSuggestInChat?: () => void;
  onSuccess?: () => void;
};

const initial: ActionResult | null = null;

export function PlayInvitationComposer({
  conversationId,
  recipientAccountId,
  recipientDisplayName,
  sharedGames,
  onSuggestInChat,
  onSuccess,
}: PlayInvitationComposerProps) {
  const [open, setOpen] = useState(false);
  const [schedulingMode, setSchedulingMode] = useState<
    "play_now" | "scheduled"
  >("play_now");
  const [selectedGameId, setSelectedGameId] = useState(
    sharedGames[0]?.gameId ?? "",
  );

  const platformsForGame = useMemo(() => {
    return sharedGames.filter((g) => g.gameId === selectedGameId);
  }, [sharedGames, selectedGameId]);

  const uniqueGames = useMemo(() => {
    const seen = new Set<string>();
    return sharedGames.filter((g) => {
      if (seen.has(g.gameId)) return false;
      seen.add(g.gameId);
      return true;
    });
  }, [sharedGames]);

  const [state, formAction, pending] = useActionState(
    async (prev: ActionResult | null, formData: FormData) => {
      const result = await proposePlayInvitation(prev, formData);
      if (result.ok) {
        setOpen(false);
        onSuccess?.();
      }
      return result;
    },
    initial,
  );

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Invite to play
      </Button>
    );
  }

  if (sharedGames.length === 0) {
    return (
      <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-cloud)] p-4">
        <p className="text-sm">
          Add a shared game with {recipientDisplayName} before sending a play
          invitation.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setOpen(false)}
        >
          Close
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      role="dialog"
      aria-modal="true"
      aria-labelledby="play-invite-title"
      className="space-y-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-cloud)] p-4"
    >
      <p id="play-invite-title" className="text-sm font-medium">
        Invite {recipientDisplayName} to play
      </p>

      <input type="hidden" name="conversationId" value={conversationId} />
      <input
        type="hidden"
        name="recipientAccountId"
        value={recipientAccountId}
      />
      <input type="hidden" name="schedulingMode" value={schedulingMode} />

      <div>
        <Label htmlFor="play-game">Game</Label>
        <Select
          id="play-game"
          name="gameId"
          required
          value={selectedGameId}
          onChange={(e) => setSelectedGameId(e.target.value)}
        >
          {uniqueGames.map((g) => (
            <option key={g.gameId} value={g.gameId}>
              {g.gameName}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="play-platform">Platform</Label>
        <Select id="play-platform" name="platformId" required defaultValue="">
          <option value="" disabled>
            Select platform
          </option>
          {platformsForGame.map((g) => (
            <option key={`${g.gameId}-${g.platformId}`} value={g.platformId}>
              {g.platformName}
            </option>
          ))}
        </Select>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">When</legend>
        <label className="flex min-h-[var(--touch-min)] cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="schedulingModeUi"
            checked={schedulingMode === "play_now"}
            onChange={() => setSchedulingMode("play_now")}
          />
          Play now
        </label>
        <label className="flex min-h-[var(--touch-min)] cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="schedulingModeUi"
            checked={schedulingMode === "scheduled"}
            onChange={() => setSchedulingMode("scheduled")}
          />
          Pick a time
        </label>
        <label className="flex min-h-[var(--touch-min)] cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="schedulingModeUi"
            onChange={() => {
              setOpen(false);
              onSuggestInChat?.();
            }}
          />
          Suggest in chat
        </label>
      </fieldset>

      {schedulingMode === "scheduled" && (
        <div className="space-y-2">
          <p className="text-xs text-[var(--color-text-slate)]">
            Add up to {MAX_TIME_SLOTS} options (your local time zone).
          </p>
          {Array.from({ length: MAX_TIME_SLOTS }, (_, i) => (
            <div key={i}>
              <Label htmlFor={`play-time-${i}`}>Option {i + 1}</Label>
              <input
                id={`play-time-${i}`}
                name="timeSlots"
                type="datetime-local"
                className="min-h-[var(--touch-min)] w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
                required={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <Label htmlFor="play-session-length">Session length</Label>
        <Select
          id="play-session-length"
          name="sessionLengthMinutes"
          required
          defaultValue="60"
        >
          {SESSION_LENGTH_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {SESSION_LENGTH_LABELS[minutes]}
            </option>
          ))}
        </Select>
      </div>

      <Checkbox
        id="play-voice-preferred"
        name="voicePreferred"
        label="Voice chat preferred"
      />

      <div>
        <Label htmlFor="play-note">Note (optional)</Label>
        <textarea
          id="play-note"
          name="note"
          maxLength={300}
          rows={3}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
          placeholder="Anything your connection should know"
        />
      </div>

      {state && !state.ok && (
        <Alert variant="error" role="alert" aria-live="assertive">
          {state.error}
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send invitation"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
