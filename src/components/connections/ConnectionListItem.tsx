import Link from "next/link";
import type { ConnectionView } from "@/domains/connections/types";

type ConnectionListItemProps = {
  connection: ConnectionView;
};

export function ConnectionListItem({ connection }: ConnectionListItemProps) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
            <Link
              href={`/profile/${connection.otherAccountId}`}
              className="text-[var(--color-night-navy)] underline-offset-2 hover:underline"
            >
              {connection.otherDisplayName}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-slate)]">
            Connected · Messaging ships in the next slice
          </p>
        </div>
      </div>
    </article>
  );
}
