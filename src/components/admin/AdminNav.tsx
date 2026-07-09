import Link from "next/link";
import { scopeAllows } from "@/domains/admin/permissions";
import type { AdminScope } from "@/domains/admin/permissions";

const links: { href: string; label: string; scope: AdminScope }[] = [
  { href: "/admin/dashboard", label: "Dashboard", scope: "support" },
  { href: "/admin/reports", label: "Reports queue", scope: "safety_review" },
  { href: "/admin/feature-controls", label: "Feature controls", scope: "security_break_glass" },
  { href: "/admin/audit", label: "Audit log", scope: "security_break_glass" },
];

export function AdminNav({ scopes }: { scopes: string[] }) {
  const visible = links.filter((link) => scopeAllows(scopes, link.scope));

  return (
    <nav aria-label="Admin" className="flex flex-col gap-1 border-b border-[var(--color-border)] bg-white px-4 py-3 md:flex-row md:items-center md:gap-4">
      <Link
        href="/discover"
        className="font-[family-name:var(--font-display)] text-sm font-bold text-[var(--color-night-navy)]"
      >
        SameLobby Admin
      </Link>
      {visible.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm text-[var(--color-lobby-teal)] hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
