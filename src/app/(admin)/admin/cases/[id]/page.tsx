import Link from "next/link";
import { notFound } from "next/navigation";
import { AppealReviewPanel } from "@/components/admin/AppealReviewPanel";
import { CaseActionForm } from "@/components/admin/CaseActionForm";
import { CaseNotesPanel } from "@/components/admin/CaseNotesPanel";
import { ClaimCaseButton } from "@/components/admin/ClaimCaseButton";
import { EvidenceViewer } from "@/components/admin/EvidenceViewer";
import { ReleaseCaseButton } from "@/components/admin/ReleaseCaseButton";
import {
  canReleaseCase,
  getAppealsForCase,
  getCaseDetail,
  getCaseNotes,
} from "@/domains/admin/queries";
import { requireAdmin } from "@/domains/admin/permissions";
import { shortCaseRef } from "@/domains/moderation/format";

type CaseDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCaseDetailPage({
  params,
}: CaseDetailPageProps) {
  const { id } = await params;
  const ctx = await requireAdmin("safety_review");
  if (!ctx.ok) notFound();

  const detail = await getCaseDetail(id);
  if (!detail?.case || !detail.report) notFound();

  const [appeals, notes, releaseEligible] = await Promise.all([
    getAppealsForCase(id),
    getCaseNotes(id),
    canReleaseCase(id),
  ]);
  const reportedAccountId = detail.report.reported_account_id as string;
  const caseStatus = detail.case.status as string;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href="/admin/reports"
          className="text-sm text-[var(--color-lobby-teal)] underline"
        >
          ← Queue
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
          Case {shortCaseRef(id)}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-slate)]">
          {detail.case.severity as string} · {caseStatus}
        </p>
      </div>

      {!detail.case.claimed_at && <ClaimCaseButton caseId={id} />}

      <section className="space-y-2">
        <h2 className="font-bold">Report</h2>
        <p className="text-sm">Category: {detail.report.category as string}</p>
        <p className="rounded-[var(--radius-md)] bg-white p-4 text-sm whitespace-pre-wrap">
          {detail.report.description as string}
        </p>
        <p className="text-sm">
          <Link
            href={`/admin/users/${reportedAccountId}`}
            className="text-[var(--color-lobby-teal)] underline"
          >
            View reported user
          </Link>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">Evidence</h2>
        <EvidenceViewer
          caseId={id}
          evidence={detail.evidence.map((row) => ({
            id: row.id as string,
            kind: row.kind as string,
            content: (row.body as string) ?? null,
            created_at: row.created_at as string,
          }))}
        />
      </section>

      <CaseNotesPanel
        caseId={id}
        notes={notes.map((n) => ({
          id: n.id as string,
          body: n.body as string,
          createdAt: n.created_at as string,
        }))}
      />

      {appeals.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-bold">Appeals</h2>
          {appeals.map((appeal) => (
            <AppealReviewPanel
              key={appeal.id as string}
              appealId={appeal.id as string}
              caseId={id}
              subjectAccountId={reportedAccountId}
              body={appeal.body as string}
              status={appeal.status as string}
            />
          ))}
        </section>
      )}

      {caseStatus !== "closed" && releaseEligible && (
        <section className="space-y-2">
          <h2 className="font-bold">Release</h2>
          <ReleaseCaseButton caseId={id} />
        </section>
      )}

      {caseStatus !== "closed" && !releaseEligible && (
        <p className="text-sm text-[var(--color-text-slate)]">
          Release becomes available after an appeal reverses the action or an
          expiring penalty reaches its end time.
        </p>
      )}

      <section className="space-y-2">
        <h2 className="font-bold">Apply action</h2>
        <CaseActionForm caseId={id} subjectAccountId={reportedAccountId} />
      </section>
    </div>
  );
}
