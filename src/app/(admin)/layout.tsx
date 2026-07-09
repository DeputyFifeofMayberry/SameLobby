import { notFound } from "next/navigation";
import { AdminMfaGate } from "@/components/admin/AdminMfaGate";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/domains/admin/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await requireAdmin();

  if (!ctx.ok) {
    if (ctx.status === 403) {
      return <AdminMfaGate />;
    }
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--color-cloud)]">
      <AdminNav scopes={ctx.scopes} />
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
