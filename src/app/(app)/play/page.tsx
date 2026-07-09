import Link from "next/link";
import { redirect } from "next/navigation";
import { PlayInvitationCard } from "@/components/play/PlayInvitationCard";
import { PlaySessionCard } from "@/components/play/PlaySessionCard";
import { Alert } from "@/components/ui/Alert";
import { requireAccount } from "@/domains/accounts/queries";
import {
  listOpenInvitationsForAccount,
  listUpcomingSessions,
} from "@/domains/play/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

export default async function PlayPage() {
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const playEnabled = await isFeatureEnabled("play_invitations_enabled");

  const [invitations, sessions] = playEnabled
    ? await Promise.all([
        listOpenInvitationsForAccount(account.id),
        listUpcomingSessions(account.id),
      ])
    : [[], []];

  const viewerTimeZone = account.time_zone ?? "America/Los_Angeles";
  const openInvitations = invitations.filter((i) => i.status === "proposed");

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Play
        </h1>
        <p className="mt-2 text-[var(--color-text-slate)]">
          Plan sessions with connections — times shown in your time zone.
        </p>
      </div>

      {!playEnabled && (
        <Alert variant="info">
          Play invitations are rolling out gradually. Message a connection to stay
          in touch in the meantime.
        </Alert>
      )}

      {playEnabled && (
        <>
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              Open invitations
            </h2>
            {openInvitations.length === 0 ? (
              <p className="text-sm text-[var(--color-text-slate)]">
                No open invitations. Send one from a{" "}
                <Link href="/messages" className="text-[var(--color-lobby-teal)] underline">
                  message thread
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-4">
                {openInvitations.map((invitation) => (
                  <li key={invitation.id}>
                    <PlayInvitationCard
                      invitation={invitation}
                      viewerTimeZone={viewerTimeZone}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              Upcoming sessions
            </h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-[var(--color-text-slate)]">
                No upcoming sessions yet.
              </p>
            ) : (
              <ul className="space-y-4">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <PlaySessionCard session={session} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
