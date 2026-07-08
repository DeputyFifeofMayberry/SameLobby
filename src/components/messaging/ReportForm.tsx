"use client";

import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { submitReport, type ActionResult } from "@/domains/messaging/actions";

type ReportFormProps = {
  reportedAccountId: string;
  conversationId: string;
  reportedDisplayName: string;
};

export function ReportForm({
  reportedAccountId,
  conversationId,
  reportedDisplayName,
}: ReportFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitReport,
    null,
  );

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Report
      </Button>
    );
  }

  if (state?.ok) {
    return (
      <Alert variant="success">
        Report received. Our team reviews reports proportionately. Blocking is separate
        from moderation.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-cloud)] p-4">
      <p className="text-sm font-medium">Report {reportedDisplayName}</p>
      <input type="hidden" name="reportedAccountId" value={reportedAccountId} />
      <input type="hidden" name="conversationId" value={conversationId} />

      <div>
        <Label htmlFor="report-category">Category</Label>
        <Select id="report-category" name="category" required defaultValue="">
          <option value="" disabled>
            Select a category
          </option>
          <option value="harassment">Harassment</option>
          <option value="spam">Spam</option>
          <option value="inappropriate_content">Inappropriate content</option>
          <option value="scam">Scam</option>
          <option value="other">Other</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="report-description">What happened?</Label>
        <textarea
          id="report-description"
          name="description"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
        />
      </div>

      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting…" : "Submit report"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
