import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserAdminSummary } from "@/domains/admin/queries";
import { requireAdmin, scopeAllows } from "@/domains/admin/permissions";
import { shortCaseRef } from "@/domains/moderation/format";

type AdminUserPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserPage({ params }: AdminUserPageProps) {
  const { id } = await params;
  const ctx = await requireAdmin("support");
  if (!ctx.ok) notFound();

  const summary = await getUserAdminSummary(id);
  if (!summary) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          {summary.displayName}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-slate)]">
          Status: {summary.account.status as string} ·{" "}
          {summary.account.email as string}
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="font-bold">Subscription</h2>
        {scopeAllows(ctx.scopes, "billing") && summary.billing ? (
          <p className="text-sm text-[var(--color-text-slate)]">
            {summary.billing.tier} · {summary.billing.subscriptionStatus}
            {summary.billing.currentPeriodEnd && (
              <>
                {" "}
                · period end{" "}
                {new Date(
                  summary.billing.currentPeriodEnd,
                ).toLocaleDateString()}
              </>
            )}
            {summary.billing.cancelAtPeriodEnd && <> · cancel at period end</>}
            {summary.billing.readOnly && <> · read-only</>}
          </p>
        ) : (
          <p className="text-sm text-[var(--color-text-slate)]">
            {scopeAllows(ctx.scopes, "billing")
              ? "No subscription record"
              : "Billing scope required"}
          </p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">Moderation actions</h2>
        {summary.actions.length === 0 ? (
          <p className="text-sm text-[var(--color-text-slate)]">None</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {summary.actions.map((action) => (
              <li key={action.id as string}>
                {action.action_type as string} · {action.reason_code as string}{" "}
                ·{" "}
                <Link
                  href={`/admin/cases/${action.case_id as string}`}
                  className="underline"
                >
                  {shortCaseRef(action.case_id as string)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-bold">Linked reports</h2>
        {summary.reports.length === 0 ? (
          <p className="text-sm text-[var(--color-text-slate)]">None</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {summary.reports.map((report) => (
              <li key={report.id as string}>
                {report.category as string} · {report.status as string}
                {report.moderation_case_id && (
                  <>
                    {" "}
                    ·{" "}
                    <Link
                      href={`/admin/cases/${report.moderation_case_id as string}`}
                      className="underline"
                    >
                      {shortCaseRef(report.moderation_case_id as string)}
                    </Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
