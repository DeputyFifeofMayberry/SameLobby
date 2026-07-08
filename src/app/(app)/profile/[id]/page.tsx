import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { requireAccount } from "@/domains/accounts/queries";
import {
  canViewProfile,
  getDiscoverableProfileBundle,
} from "@/domains/discovery/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { TIME_ZONE_OPTIONS } from "@/lib/timezones";
import type { CommunicationMode, IntentGoal } from "@/domains/profile/types";
import type { UserGameRow } from "@/domains/games/types";
import { ProfileConnectionPanel } from "@/components/connections/ProfileConnectionPanel";

type ProfileViewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicProfilePage({ params }: ProfileViewPageProps) {
  const { id: targetAccountId } = await params;
  const viewerAccount = await requireAccount();
  const ownProfile = await getGamerProfileForAccount(viewerAccount.id);

  if (!ownProfile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  if (targetAccountId === viewerAccount.id) {
    redirect("/profile");
  }

  const allowed = await canViewProfile(viewerAccount.id, targetAccountId);
  if (!allowed) {
    notFound();
  }

  const bundle = await getDiscoverableProfileBundle(targetAccountId);
  if (!bundle.profile || !bundle.account) {
    notFound();
  }

  const timeZoneLabel =
    TIME_ZONE_OPTIONS.find((tz) => tz.value === bundle.account?.time_zone)?.label ??
    bundle.account.time_zone ??
    "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/discover" className="text-sm text-[var(--color-lobby-teal)] underline">
        ← Back to discover
      </Link>
      <ProfilePreview
        displayName={bundle.profile.display_name ?? "Player"}
        timeZoneLabel={timeZoneLabel}
        userGames={bundle.userGames as unknown as UserGameRow[]}
        communicationModes={bundle.profile.communication_modes as CommunicationMode[]}
        goal={(bundle.intent?.goal as IntentGoal) ?? null}
      />
      <ProfileConnectionPanel
        viewerAccountId={viewerAccount.id}
        targetAccountId={targetAccountId}
        targetDisplayName={bundle.profile.display_name ?? "Player"}
      />
    </div>
  );
}
