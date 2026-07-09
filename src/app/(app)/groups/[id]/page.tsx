import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GroupApprovalCard } from "@/components/groups/GroupApprovalCard";
import { OpenSeatForm } from "@/components/groups/OpenSeatForm";
import { ReportEntry } from "@/components/moderation/ReportEntry";
import { Alert } from "@/components/ui/Alert";
import { requireAccount } from "@/domains/accounts/queries";
import { getGroupDetail } from "@/domains/groups/queries";
import { ensureGroupConversation } from "@/domains/groups/actions";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

type GroupDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id: groupId } = await params;
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const groupsEnabled = await isFeatureEnabled("private_groups_enabled");
  if (!groupsEnabled) {
    redirect("/teammates");
  }

  let group = await getGroupDetail(account.id, groupId);
  if (!group) {
    notFound();
  }

  if (group.status === "active" && !group.conversationId) {
    const conversationId = await ensureGroupConversation(groupId);
    if (conversationId) {
      group = { ...group, conversationId };
    }
  }

  const viewerMember = group.members.find((m) => m.accountId === account.id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/teammates" className="text-sm text-[var(--color-lobby-teal)] underline">
          ← Teammates
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
          {group.name}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-slate)]">
          {group.members.filter((m) => m.status === "active").length} / {group.sizeGoal}{" "}
          members · {group.status}
          {group.gameName ? ` · ${group.gameName}` : ""}
        </p>
      </div>

      {group.conversationId && (
        <Link
          href={`/messages/${group.conversationId}`}
          className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-lobby-teal)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Open group chat
        </Link>
      )}

      {group.pendingApprovals.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
            Pending approvals
          </h2>
          <ul className="space-y-3">
            {group.pendingApprovals.map((approval) => (
              <li key={approval.inviteeAccountId}>
                <GroupApprovalCard approval={approval} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          Members
        </h2>
        <ul className="space-y-2">
          {group.members.map((member) => (
            <li
              key={member.accountId}
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-3 text-sm"
            >
              <Link
                href={`/profile/${member.accountId}`}
                className="font-medium hover:underline"
              >
                {member.displayName}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-[var(--color-text-slate)]">
                  {member.role}
                  {member.status === "pending_approval" ? " · pending" : ""}
                </span>
                {member.accountId !== account.id && member.status === "active" && (
                  <ReportEntry
                    reportedAccountId={member.accountId}
                    reportedDisplayName={member.displayName}
                    groupId={group.id}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {group.pendingInvitations.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
            Pending invitations
          </h2>
          <ul className="list-inside list-disc text-sm text-[var(--color-text-slate)]">
            {group.pendingInvitations.map((inv) => (
              <li key={inv.id}>{inv.inviteeDisplayName}</li>
            ))}
          </ul>
        </section>
      )}

      {group.status === "forming" && (
        <Alert variant="info">
          Group becomes active once at least three members are approved.
        </Alert>
      )}

      {viewerMember?.status === "active" && (
        <OpenSeatForm
          groupId={group.id}
          unavailableAccountId={account.id}
          unavailableDisplayName="You"
        />
      )}
    </div>
  );
}
