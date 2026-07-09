"use client";

import { useState } from "react";
import { ReportForm } from "@/components/messaging/ReportForm";

type GroupReportFormProps = {
  groupId: string;
  conversationId: string;
  members: { accountId: string; displayName: string }[];
};

export function GroupReportForm({ groupId, conversationId, members }: GroupReportFormProps) {
  const [selectedId, setSelectedId] = useState(members[0]?.accountId ?? "");

  if (members.length === 0) return null;

  const selected = members.find((m) => m.accountId === selectedId) ?? members[0];

  return (
    <div className="flex flex-wrap items-end gap-2">
      {members.length > 1 && (
        <label className="text-sm">
          <span className="sr-only">Member to report</span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-2 py-1 text-sm"
          >
            {members.map((m) => (
              <option key={m.accountId} value={m.accountId}>
                {m.displayName}
              </option>
            ))}
          </select>
        </label>
      )}
      <ReportForm
        reportedAccountId={selected.accountId}
        reportedDisplayName={selected.displayName}
        groupId={groupId}
        conversationId={conversationId}
        showMessageContextOption
      />
    </div>
  );
}
