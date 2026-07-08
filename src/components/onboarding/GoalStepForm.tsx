"use client";

import { useActionState } from "react";
import { saveGoalStep, type ActionResult } from "@/domains/profile/actions";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { INTENT_GOALS, INTENT_GOAL_LABELS } from "@/domains/profile/types";

const initial: ActionResult | null = null;

export function GoalStepForm() {
  const [state, formAction, pending] = useActionState(saveGoalStep, initial);

  return (
    <form action={formAction} className="mx-auto max-w-lg space-y-6">
      <div>
        <Label htmlFor="goal">What are you looking for now?</Label>
        <Select id="goal" name="goal" required defaultValue="">
          <option value="" disabled>
            Select a goal
          </option>
          {INTENT_GOALS.map((goal) => (
            <option key={goal} value={goal}>
              {INTENT_GOAL_LABELS[goal]}
            </option>
          ))}
        </Select>
      </div>
      {state && !state.ok && (
        <Alert variant="error" role="alert">
          {state.error}
        </Alert>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
