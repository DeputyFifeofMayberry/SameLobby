import Link from "next/link";
import { BlockedUserRow } from "@/components/settings/BlockedUserRow";
import { requireAccount } from "@/domains/accounts/queries";
import { listBlocksForAccount } from "@/domains/connections/queries";

export default async function BlockedSettingsPage() {
  const account = await requireAccount();
  const blocked = await listBlocksForAccount(account.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/settings/safety" className="text-sm text-[var(--color-lobby-teal)] underline">
          ← Safety Center
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
          Blocked users
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-slate)]">
          Blocking is immediate and silent. It is not a moderation finding.
        </p>
      </div>
      {blocked.length === 0 ? (
        <p className="text-sm text-[var(--color-text-slate)]">You have not blocked anyone.</p>
      ) : (
        <ul className="space-y-3">
          {blocked.map((row) => (
            <BlockedUserRow
              key={row.accountId}
              accountId={row.accountId}
              displayName={row.displayName}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
