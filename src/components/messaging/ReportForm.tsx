"use client";

import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  submitReport,
  type ActionResult,
} from "@/domains/moderation/actions";
import { shortCaseRef } from "@/domains/moderation/format";

type ReportFormProps = {
  reportedAccountId: string;
  reportedDisplayName: string;
  conversationId?: string;
  groupId?: string;
  playInvitationId?: string;
  showMessageContextOption?: boolean;
};

export function ReportForm({
  reportedAccountId,
  reportedDisplayName,
  conversationId,
  groupId,
  playInvitationId,
  showMessageContextOption = false,
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
    const ref = state.caseId ? shortCaseRef(state.caseId) : "pending";
    return (
      <Alert variant="success" role="status">
        Report received. Case reference {ref}. Blocking is separate from moderation.
      </Alert>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-cloud)] p-4"
    >
      <p className="text-sm font-medium">Report {reportedDisplayName}</p>
      <input type="hidden" name="reportedAccountId" value={reportedAccountId} />
      {conversationId && (
        <input type="hidden" name="conversationId" value={conversationId} />
      )}
      {groupId && <input type="hidden" name="groupId" value={groupId} />}
      {playInvitationId && (
        <input type="hidden" name="playInvitationId" value={playInvitationId} />
      )}

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

      {showMessageContextOption && conversationId && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="includeMessageContext" />
          Include recent messages from this chat (up to 5)
        </label>
      )}

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
