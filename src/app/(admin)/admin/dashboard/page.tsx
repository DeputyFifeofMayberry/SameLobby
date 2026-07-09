import { notFound } from "next/navigation";
import { scopeAllows } from "@/domains/admin/permissions";
import {
  getAdminDashboardStats,
  getRegistrationCapUtilization,
} from "@/domains/admin/queries";
import { requireAdmin } from "@/domains/admin/permissions";

export default async function AdminDashboardPage() {
  const ctx = await requireAdmin("support");
  if (!ctx.ok) notFound();

  const [stats, capUtil] = await Promise.all([
    getAdminDashboardStats(),
    getRegistrationCapUtilization(),
  ]);

  const capPercent =
    capUtil.maxAccounts > 0
      ? Math.round((capUtil.currentCount / capUtil.maxAccounts) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Safety dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Open P0" value={stats.openBySeverity.p0} />
        <StatCard label="Open P1" value={stats.openBySeverity.p1} />
        <StatCard label="Open P2" value={stats.openBySeverity.p2} />
        <StatCard label="Open P3" value={stats.openBySeverity.p3} />
        <StatCard label="Overdue P1 (>24h)" value={stats.overdueP1} />
        <StatCard label="Overdue P2 (>72h)" value={stats.overdueP2} />
        <StatCard
          label="Registration cap"
          value={capPercent}
          suffix="% utilized"
          detail={`${capUtil.currentCount.toLocaleString()} / ${capUtil.maxAccounts.toLocaleString()}`}
        />
      </div>
      {scopeAllows(ctx.scopes, "safety_review") && (
        <p className="text-sm">
          <a
            href="/admin/reports"
            className="text-[var(--color-lobby-teal)] underline"
          >
            Open reports queue →
          </a>
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  detail,
}: {
  label: string;
  value: number;
  suffix?: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <p className="text-sm text-[var(--color-text-slate)]">{label}</p>
      <p className="mt-1 text-3xl font-bold">
        {value}
        {suffix ? (
          <span className="ml-1 text-base font-normal text-[var(--color-text-slate)]">
            {suffix}
          </span>
        ) : null}
      </p>
      {detail && (
        <p className="mt-1 text-xs text-[var(--color-text-slate)]">{detail}</p>
      )}
    </div>
  );
}
