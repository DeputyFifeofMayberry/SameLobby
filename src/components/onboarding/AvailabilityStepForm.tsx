"use client";

import { useActionState } from "react";
import {
  saveAvailabilityStep,
  type ActionResult,
} from "@/domains/profile/actions";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { DAY_LABELS } from "@/lib/timezones";
import Link from "next/link";
import { skipAvailabilityStep } from "@/domains/profile/actions";

const initial: ActionResult | null = null;

export function AvailabilityStepForm() {
  const [state, formAction, pending] = useActionState(
    saveAvailabilityStep,
    initial,
  );

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <form action={formAction} className="space-y-6">
        <p className="text-sm text-[var(--color-text-slate)]">
          Optional: add a broad weekly window. Match-only by default — others see
          overlap, not your full schedule.
        </p>
        <div>
          <Label htmlFor="dayOfWeek">Day</Label>
          <Select id="dayOfWeek" name="dayOfWeek" defaultValue="1">
            {DAY_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start</Label>
            <Input id="startTime" name="startTime" type="time" required />
          </div>
          <div>
            <Label htmlFor="endTime">End</Label>
            <Input id="endTime" name="endTime" type="time" required />
          </div>
        </div>
        {state && !state.ok && (
          <Alert variant="error" role="alert">
            {state.error}
          </Alert>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving…" : "Save and continue"}
        </Button>
      </form>
      <form action={skipAvailabilityStep}>
        <Button type="submit" variant="ghost" className="w-full">
          Skip for now
        </Button>
      </form>
      <p className="text-center text-xs text-[var(--color-text-slate)]">
        You can update availability later from{" "}
        <Link href="/profile" className="text-[var(--color-lobby-teal)] underline">
          Profile
        </Link>
        .
      </p>
    </div>
  );
}
