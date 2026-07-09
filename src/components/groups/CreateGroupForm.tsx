"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createPrivateGroup, type ActionResult } from "@/domains/groups/actions";
import { GROUP_EMBLEM_OPTIONS } from "@/domains/groups/constants";
import type { ConnectionView } from "@/domains/connections/types";
import type { Game } from "@/domains/games/types";

const initial: ActionResult | null = null;

type CreateGroupFormProps = {
  connections: ConnectionView[];
  games: Game[];
  preselectedInviteeId?: string;
};

export function CreateGroupForm({
  connections,
  games,
  preselectedInviteeId,
}: CreateGroupFormProps) {
  const [state, formAction, pending] = useActionState(createPrivateGroup, initial);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok && state.groupId) {
      router.push(`/groups/${state.groupId}`);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="group-name" className="block text-sm font-medium">
          Group name
        </label>
        <input
          id="group-name"
          name="name"
          type="text"
          required
          minLength={3}
          maxLength={40}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="size-goal" className="block text-sm font-medium">
          Size goal (3–8)
        </label>
        <input
          id="size-goal"
          name="sizeGoal"
          type="number"
          min={3}
          max={8}
          defaultValue={4}
          required
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Emblem</legend>
        <div className="flex flex-wrap gap-3">
          {GROUP_EMBLEM_OPTIONS.map((emblem) => (
            <label key={emblem.key} className="flex items-center gap-2 text-sm">
              <input type="radio" name="emblemKey" value={emblem.key} />
              {emblem.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="shared-game" className="block text-sm font-medium">
          Shared game (optional)
        </label>
        <select
          id="shared-game"
          name="sharedGameId"
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
          defaultValue=""
        >
          <option value="">No specific game</option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Invite connections (1–7)</legend>
        <p className="text-xs text-[var(--color-text-slate)]">
          You count toward the size goal. Pick at least one connection to start forming.
        </p>
        <div className="space-y-2">
          {connections.map((connection) => (
            <label
              key={connection.id}
              className="flex min-h-[var(--touch-min)] items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                name="inviteeIds"
                value={connection.otherAccountId}
                defaultChecked={
                  preselectedInviteeId === connection.otherAccountId
                }
              />
              {connection.otherDisplayName}
            </label>
          ))}
        </div>
      </fieldset>

      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create group"}
      </Button>
    </form>
  );
}
