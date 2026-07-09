import { notFound } from "next/navigation";
import { FeatureFlagToggle } from "@/components/admin/FeatureFlagToggle";
import { listFeatureFlags } from "@/domains/admin/queries";
import { requireAdmin } from "@/domains/admin/permissions";

export default async function AdminFeatureControlsPage() {
  const ctx = await requireAdmin("security_break_glass");
  if (!ctx.ok) notFound();

  const flags = await listFeatureFlags();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Feature controls
      </h1>
      <ul className="space-y-4">
        {flags.map((flag) => (
          <li
            key={flag.key as string}
            className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-4"
          >
            <div>
              <p className="font-medium">{flag.key as string}</p>
              <p className="text-sm text-[var(--color-text-slate)]">
                {flag.enabled ? "Enabled" : "Disabled"}
              </p>
            </div>
            <FeatureFlagToggle
              flagKey={flag.key as string}
              enabled={flag.enabled === true}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
