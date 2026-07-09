import { notFound, redirect } from "next/navigation";
import { PlaySessionDetailClient } from "@/components/play/PlaySessionDetailClient";
import { requireAccount } from "@/domains/accounts/queries";
import { getSessionDetail } from "@/domains/play/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

type SessionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlaySessionPage({ params }: SessionPageProps) {
  const { id } = await params;
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const playEnabled = await isFeatureEnabled("play_invitations_enabled");
  if (!playEnabled) {
    redirect("/play");
  }

  const session = await getSessionDetail(account.id, id);
  if (!session) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PlaySessionDetailClient session={session} />
    </div>
  );
}
