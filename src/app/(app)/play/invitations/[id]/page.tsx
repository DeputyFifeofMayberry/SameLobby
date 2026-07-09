import { notFound, redirect } from "next/navigation";
import { PlayInvitationDetailClient } from "@/components/play/PlayInvitationDetailClient";
import { requireAccount } from "@/domains/accounts/queries";
import { getPlayInvitationDetail } from "@/domains/play/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

type InvitationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlayInvitationPage({ params }: InvitationPageProps) {
  const { id } = await params;
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const playEnabled = await isFeatureEnabled("play_invitations_enabled");
  const reportingEnabled = await isFeatureEnabled("reporting_enabled");
  if (!playEnabled) {
    redirect("/play");
  }

  const invitation = await getPlayInvitationDetail(account.id, id);
  if (!invitation) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PlayInvitationDetailClient
        invitation={invitation}
        viewerTimeZone={account.time_zone ?? "America/Los_Angeles"}
        reportingEnabled={reportingEnabled}
      />
    </div>
  );
}
