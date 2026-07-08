"use client";

import { useActionState } from "react";
import {
  completeOnboarding,
  type ActionResult,
} from "@/domains/profile/actions";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import type { CommunicationMode, IntentGoal } from "@/domains/profile/types";
import type { UserGameRow } from "@/domains/games/types";

const initial: ActionResult | null = null;

type Props = {
  displayName: string;
  timeZoneLabel: string;
  userGames: UserGameRow[];
  communicationModes: CommunicationMode[];
  goal: IntentGoal | null;
};

export function PreviewStepForm({
  displayName,
  timeZoneLabel,
  userGames,
  communicationModes,
  goal,
}: Props) {
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initial,
  );

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <ProfilePreview
        displayName={displayName}
        timeZoneLabel={timeZoneLabel}
        userGames={userGames}
        communicationModes={communicationModes}
        goal={goal}
      />
      <form action={formAction}>
        {state && !state.ok && (
          <Alert variant="error" role="alert" className="mb-4">
            {state.error}
          </Alert>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Finishing…" : "Continue to Discover"}
        </Button>
      </form>
    </div>
  );
}
