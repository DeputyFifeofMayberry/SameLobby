import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaimCaseButton } from "@/components/admin/ClaimCaseButton";
import { listOpenCases } from "@/domains/admin/queries";
import { requireAdmin } from "@/domains/admin/permissions";
import { shortCaseRef } from "@/domains/moderation/format";

export default async function AdminReportsPage() {
  const ctx = await requireAdmin("safety_review");
  if (!ctx.ok) notFound();

  const cases = await listOpenCases();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Reports queue
      </h1>
      {cases.length === 0 ? (
        <p className="text-sm text-[var(--color-text-slate)]">No open cases.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Case</th>
              <th className="py-2 pr-4">Severity</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Age</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => (
              <tr
                key={item.id}
                className={`border-b border-[var(--color-border)] ${item.isOverdue ? "bg-[var(--color-error-bg)]" : ""}`}
              >
                <td className="py-3 pr-4">
                  <Link
                    href={`/admin/cases/${item.id}`}
                    className="font-mono text-xs underline"
                  >
                    {shortCaseRef(item.id)}
                  </Link>
                </td>
                <td className="py-3 pr-4 uppercase">{item.severity}</td>
                <td className="py-3 pr-4">{item.status}</td>
                <td className="py-3 pr-4">
                  {new Date(item.createdAt).toLocaleString()}
                </td>
                <td className="py-3">
                  {!item.claimedAt && <ClaimCaseButton caseId={item.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
