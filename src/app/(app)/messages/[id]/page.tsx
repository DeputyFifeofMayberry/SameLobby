import { notFound, redirect } from "next/navigation";
import { MessageThreadClient } from "@/components/messaging/MessageThreadClient";
import { requireAccount } from "@/domains/accounts/queries";
import { openConversation } from "@/domains/messaging/actions";
import { buildIcebreakers } from "@/domains/messaging/icebreakers";
import { canSendMessages } from "@/domains/messaging/permissions";
import { getConversationThread } from "@/domains/messaging/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id: conversationId } = await params;
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const messagingEnabled = await isFeatureEnabled("messaging_enabled");
  if (!messagingEnabled) {
    redirect("/messages");
  }

  const thread = await getConversationThread(account.id, conversationId);
  if (!thread) {
    notFound();
  }

  await openConversation(conversationId);

  const [linksInMessagesEnabled] = await Promise.all([
    isFeatureEnabled("links_in_messages"),
  ]);

  const sharedGames = thread.sharedGameLabels.map((label) => {
    const [gameName, platformName] = label.split(" · ");
    return {
      gameName: gameName ?? label,
      platformName: platformName ?? "",
    };
  });

  const icebreakers = buildIcebreakers({
    sharedGames,
    goal: thread.goal,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          {thread.otherDisplayName}
        </h1>
        {thread.sharedGameLabels.length > 0 && (
          <p className="mt-1 text-sm text-[var(--color-text-slate)]">
            Shared: {thread.sharedGameLabels.join(", ")}
          </p>
        )}
        {thread.goalLabel && (
          <p className="mt-1 text-sm text-[var(--color-text-slate)]">
            Goal: {thread.goalLabel}
          </p>
        )}
      </header>

      <MessageThreadClient
        conversationId={conversationId}
        viewerAccountId={account.id}
        otherAccountId={thread.otherAccountId}
        otherDisplayName={thread.otherDisplayName}
        initialMessages={thread.messages}
        icebreakers={icebreakers}
        linksInMessagesEnabled={linksInMessagesEnabled}
        canSend={canSendMessages(thread.conversation.permission)}
      />
    </div>
  );
}
