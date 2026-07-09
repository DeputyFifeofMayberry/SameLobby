import Link from "next/link";
import { redirect } from "next/navigation";
import { AppealForm } from "@/components/moderation/AppealForm";
import { Alert } from "@/components/ui/Alert";
import { requireAccount } from "@/domains/accounts/queries";
import { listEligibleAppeals, listReportsForAccount } from "@/domains/moderation/queries";
import { shortCaseRef } from "@/domains/moderation/format";
import { isFeatureEnabled } from "@/lib/feature-flags";

export default async function SafetySettingsPage() {
  const account = await requireAccount();
  const reportingEnabled = await isFeatureEnabled("reporting_enabled");

  if (!reportingEnabled) {
    redirect("/settings/account");
  }

  const [reports, appeals] = await Promise.all([
    listReportsForAccount(account.id),
    listEligibleAppeals(account.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Safety Center
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-slate)]">
          Your reports and appeals. We do not provide emergency monitoring — if
          you are in immediate danger, contact local emergency services.
        </p>
      </div>

      <Alert variant="info">
        Read our{" "}
        <Link href="/safety" className="underline">
          community standards
        </Link>
        . Manage blocked players on{" "}
        <Link href="/settings/blocked" className="underline">
          Blocked users
        </Link>
        .
      </Alert>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Your reports
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-[var(--color-text-slate)]">No reports yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4">Case</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-[var(--color-border)]">
                  <td className="py-3 pr-4 font-mono text-xs">
                    {report.caseId ? shortCaseRef(report.caseId) : "—"}
                  </td>
                  <td className="py-3 pr-4">{report.category}</td>
                  <td className="py-3">{report.limitedStatusLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Appeals
        </h2>
        {appeals.length === 0 ? (
          <p className="text-sm text-[var(--color-text-slate)]">
            No eligible appeals right now.
          </p>
        ) : (
          <ul className="space-y-4">
            {appeals.map((appeal) => (
              <li key={appeal.actionId}>
                <AppealForm appeal={appeal} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
