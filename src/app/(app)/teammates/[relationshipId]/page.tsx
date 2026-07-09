import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TeammateNoteEditor } from "@/components/teammates/TeammateNoteEditor";
import { TeammateProposalCard } from "@/components/teammates/TeammateProposalCard";
import { ReportEntry } from "@/components/moderation/ReportEntry";
import { Alert } from "@/components/ui/Alert";
import { requireAccount } from "@/domains/accounts/queries";
import { getSharedGamesForConversation } from "@/domains/play/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { getTeammateDetail } from "@/domains/teammates/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

type TeammateDetailPageProps = {
  params: Promise<{ relationshipId: string }>;
};

export default async function TeammateDetailPage({ params }: TeammateDetailPageProps) {
  const { relationshipId } = await params;
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const teammatesEnabled = await isFeatureEnabled("teammates_enabled");
  if (!teammatesEnabled) {
    redirect("/teammates");
  }

  const detail = await getTeammateDetail(account.id, relationshipId);
  if (!detail) {
    notFound();
  }

  const sharedGames = await getSharedGamesForConversation(
    account.id,
    detail.otherAccountId,
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/teammates" className="text-sm text-[var(--color-lobby-teal)] underline">
          ← Teammates
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
          {detail.otherDisplayName}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-slate)]">
          Status: {detail.status.replace("_", " ")}
        </p>
      </div>

      {detail.status === "proposed" && (
        <TeammateProposalCard
          teammate={{
            id: detail.id,
            otherAccountId: detail.otherAccountId,
            otherDisplayName: detail.otherDisplayName,
            status: detail.status,
            direction:
              detail.proposed_by_account_id === account.id ? "outgoing" : "incoming",
            sharedGameLabels: sharedGames.map(
              (g) => `${g.gameName} · ${g.platformName}`,
            ),
            isRegular: false,
          }}
        />
      )}

      {sharedGames.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
            Shared games
          </h2>
          <ul className="list-inside list-disc text-sm text-[var(--color-text-slate)]">
            {sharedGames.map((game) => (
              <li key={`${game.gameId}-${game.platformId}`}>
                {game.gameName} · {game.platformName}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {detail.conversationId && (
          <Link
            href={`/messages/${detail.conversationId}`}
            className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-lobby-teal)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-lobby-teal)] hover:bg-[var(--color-signal-mint)]"
          >
            Message
          </Link>
        )}
        <Link
          href={`/profile/${detail.otherAccountId}`}
          className="inline-flex min-h-[var(--touch-min)] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-lobby-teal)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-lobby-teal)] hover:bg-[var(--color-signal-mint)]"
        >
          View profile
        </Link>
        <ReportEntry
          reportedAccountId={detail.otherAccountId}
          reportedDisplayName={detail.otherDisplayName}
        />
      </div>

      {detail.status !== "proposed" && detail.status !== "ended" && (
        <TeammateNoteEditor
          relationshipId={detail.id}
          initialBody={detail.noteBody}
        />
      )}

      {detail.status === "ended" && (
        <Alert variant="info">This teammate relationship has ended.</Alert>
      )}
    </div>
  );
}
