"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { applyCaseAction } from "@/domains/admin/actions";
import type { ModerationActionType } from "@/domains/moderation/types";

type CaseActionFormProps = {
  caseId: string;
  subjectAccountId: string;
};

const ACTION_OPTIONS: { value: ModerationActionType; label: string }[] = [
  { value: "warn", label: "Warn" },
  { value: "restrict_messaging", label: "Restrict messaging" },
  { value: "restrict_discovery", label: "Restrict discovery" },
  { value: "suspend", label: "Suspend" },
  { value: "close_no_action", label: "Close — no action" },
];

export function CaseActionForm({ caseId, subjectAccountId }: CaseActionFormProps) {
  const [actionType, setActionType] = useState<ModerationActionType>("warn");
  const [reasonCode, setReasonCode] = useState("policy_violation");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return <Alert variant="success">Action applied.</Alert>;
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await applyCaseAction(
            caseId,
            subjectAccountId,
            actionType,
            reasonCode,
          );
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setDone(true);
        });
      }}
    >
      <div>
        <label className="text-sm font-medium" htmlFor="action-type">
          Action
        </label>
        <Select
          id="action-type"
          value={actionType}
          onChange={(e) => setActionType(e.target.value as ModerationActionType)}
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="reason-code">
          Reason code
        </label>
        <input
          id="reason-code"
          value={reasonCode}
          onChange={(e) => setReasonCode(e.target.value)}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>
      {error && <Alert variant="error">{error}</Alert>}
      <Button type="submit" disabled={pending}>
        {pending ? "Applying…" : "Apply action"}
      </Button>
    </form>
  );
}
