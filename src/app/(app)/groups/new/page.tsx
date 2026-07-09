import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateGroupForm } from "@/components/groups/CreateGroupForm";
import { Alert } from "@/components/ui/Alert";
import { requireAccount } from "@/domains/accounts/queries";
import { getActiveConnections } from "@/domains/connections/queries";
import { countActiveGroupsOwned } from "@/domains/groups/queries";
import { canCreateAnotherFreeGroup } from "@/domains/groups/schemas";
import { listGames } from "@/domains/games/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

type NewGroupPageProps = {
  searchParams: Promise<{ invite?: string }>;
};

export default async function NewGroupPage({ searchParams }: NewGroupPageProps) {
  const { invite: preselectedInviteeId } = await searchParams;
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const groupsEnabled = await isFeatureEnabled("private_groups_enabled");
  if (!groupsEnabled) {
    redirect("/teammates");
  }

  const [connections, games, ownedCount] = await Promise.all([
    getActiveConnections(account.id),
    listGames(),
    countActiveGroupsOwned(account.id),
  ]);

  const canCreate = canCreateAnotherFreeGroup(ownedCount);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/teammates" className="text-sm text-[var(--color-lobby-teal)] underline">
          ← Teammates
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
          Create private group
        </h1>
        <p className="mt-2 text-[var(--color-text-slate)]">
          Invitation-only squads of 3–8 players. New members need group approval.
        </p>
      </div>

      {!canCreate && (
        <Alert variant="info">
          You already have an active private group on the free plan.
        </Alert>
      )}

      {canCreate && (
        <CreateGroupForm
          connections={connections}
          games={games}
          preselectedInviteeId={preselectedInviteeId}
        />
      )}
    </div>
  );
}
