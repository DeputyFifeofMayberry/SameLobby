import { notFound } from "next/navigation";
import { listAuditEvents } from "@/domains/admin/queries";
import { requireAdmin } from "@/domains/admin/permissions";

export default async function AdminAuditPage() {
  const ctx = await requireAdmin("security_break_glass");
  if (!ctx.ok) notFound();

  const events = await listAuditEvents(100);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Audit log
      </h1>
      {events.length === 0 ? (
        <p className="text-sm text-[var(--color-text-slate)]">No events.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Resource</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id as string} className="border-b border-[var(--color-border)]">
                <td className="py-2 pr-4">
                  {new Date(event.created_at as string).toLocaleString()}
                </td>
                <td className="py-2 pr-4">{event.action as string}</td>
                <td className="py-2 pr-4">
                  {event.resource_type as string}
                  {event.resource_id ? ` · ${event.resource_id as string}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
