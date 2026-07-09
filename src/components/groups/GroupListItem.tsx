import Link from "next/link";
import type { GroupListItem as GroupListItemType } from "@/domains/groups/types";

type GroupListItemProps = {
  group: GroupListItemType;
};

export function GroupListItem({ group }: GroupListItemProps) {
  return (
    <li>
      <Link
        href={`/groups/${group.id}`}
        className="block rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-5 transition-colors hover:bg-[var(--color-cloud)]"
      >
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold">
          {group.name}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-slate)]">
          {group.memberCount} / {group.sizeGoal} members · {group.status}
          {group.gameName ? ` · ${group.gameName}` : ""}
        </p>
      </Link>
    </li>
  );
}
