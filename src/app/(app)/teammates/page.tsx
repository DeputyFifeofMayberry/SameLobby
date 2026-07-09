import Link from "next/link";
import { redirect } from "next/navigation";
import { GroupInvitationCard } from "@/components/groups/GroupInvitationCard";
import { GroupListItem } from "@/components/groups/GroupListItem";
import { ProposeTeammateForm } from "@/components/teammates/ProposeTeammateForm";
import { TeammateListItemCard } from "@/components/teammates/TeammateListItemCard";
import { TeammateProposalCard } from "@/components/teammates/TeammateProposalCard";
import { Alert } from "@/components/ui/Alert";
import { requireAccount } from "@/domains/accounts/queries";
import { listIncomingGroupInvitations, listGroupsForAccount } from "@/domains/groups/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import {
  listEligibleConnectionsForTeammate,
  listTeammatesForAccount,
} from "@/domains/teammates/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

export default async function TeammatesPage() {
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const [teammatesEnabled, groupsEnabled] = await Promise.all([
    isFeatureEnabled("teammates_enabled"),
    isFeatureEnabled("private_groups_enabled"),
  ]);

  const [teammates, eligible, groups, incomingInvitations] = await Promise.all([
    teammatesEnabled ? listTeammatesForAccount(account.id) : [],
    teammatesEnabled ? listEligibleConnectionsForTeammate(account.id) : [],
    groupsEnabled ? listGroupsForAccount(account.id) : [],
    groupsEnabled ? listIncomingGroupInvitations(account.id) : [],
  ]);

  const regular = teammates.filter((t) => t.isRegular);
  const active = teammates.filter(
    (t) => t.status === "teammate" && !t.isRegular,
  );
  const proposals = teammates.filter((t) => t.status === "proposed");

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Teammates
        </h1>
        <p className="mt-2 text-[var(--color-text-slate)]">
          Mutual teammate choices stay private until you both agree.
        </p>
      </div>

      {!teammatesEnabled && !groupsEnabled && (
        <Alert variant="info">
          Teammates and private groups are rolling out gradually.
        </Alert>
      )}

      {groupsEnabled && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              Private groups
            </h2>
            <Link
              href="/groups/new"
              className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-lobby-teal)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-lobby-teal)] hover:bg-[var(--color-signal-mint)]"
            >
              Create group
            </Link>
          </div>

          {incomingInvitations.length > 0 && (
            <ul className="space-y-4">
              {incomingInvitations.map((invitation) => (
                <li key={invitation.id}>
                  <GroupInvitationCard invitation={invitation} />
                </li>
              ))}
            </ul>
          )}

          {groups.length === 0 ? (
            <p className="text-sm text-[var(--color-text-slate)]">
              No groups yet. Invite connections to form a private squad.
            </p>
          ) : (
            <ul className="space-y-4">
              {groups.map((group) => (
                <GroupListItem key={group.id} group={group} />
              ))}
            </ul>
          )}
        </section>
      )}

      {teammatesEnabled && (
        <>
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              Regular teammates
            </h2>
            {regular.length === 0 ? (
              <p className="text-sm text-[var(--color-text-slate)]">
                Mark trusted teammates as regulars for quick access.
              </p>
            ) : (
              <ul className="space-y-4">
                {regular.map((teammate) => (
                  <li key={teammate.id}>
                    <TeammateListItemCard teammate={teammate} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              Teammates
            </h2>
            {active.length === 0 ? (
              <p className="text-sm text-[var(--color-text-slate)]">
                No teammates yet. Affirm a proposal or choose &ldquo;Add as teammate&rdquo;
                after a completed session.
              </p>
            ) : (
              <ul className="space-y-4">
                {active.map((teammate) => (
                  <li key={teammate.id}>
                    <TeammateListItemCard teammate={teammate} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              Proposals
            </h2>
            {proposals.length === 0 ? (
              <p className="text-sm text-[var(--color-text-slate)]">
                No open proposals.
              </p>
            ) : (
              <ul className="space-y-4">
                {proposals.map((teammate) => (
                  <li key={teammate.id}>
                    <TeammateProposalCard teammate={teammate} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              Propose a teammate
            </h2>
            <ProposeTeammateForm eligible={eligible} />
          </section>
        </>
      )}
    </div>
  );
}
