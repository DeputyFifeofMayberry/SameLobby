"use client";

import { useEffect } from "react";
import { recordEvidenceView } from "@/domains/admin/actions";

type EvidenceViewerProps = {
  caseId: string;
  evidence: {
    id: string;
    kind: string;
    content: string | null;
    created_at: string;
  }[];
};

export function EvidenceViewer({ caseId, evidence }: EvidenceViewerProps) {
  useEffect(() => {
    void recordEvidenceView(caseId);
  }, [caseId]);

  if (evidence.length === 0) {
    return <p className="text-sm text-[var(--color-text-slate)]">No evidence attached.</p>;
  }

  return (
    <ul className="space-y-3">
      {evidence.map((item) => (
        <li
          key={item.id}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4 text-sm"
        >
          <p className="text-xs font-medium uppercase text-[var(--color-text-slate)]">
            {item.kind}
          </p>
          <p className="mt-2 whitespace-pre-wrap">{item.content ?? "—"}</p>
        </li>
      ))}
    </ul>
  );
}
