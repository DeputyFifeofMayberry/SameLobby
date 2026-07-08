import Link from "next/link";
import { redirect } from "next/navigation";
import { ConversationList } from "@/components/messaging/ConversationList";
import { Alert } from "@/components/ui/Alert";
import { requireAccount } from "@/domains/accounts/queries";
import { listConversationsForAccount } from "@/domains/messaging/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

export default async function MessagesPage() {
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const messagingEnabled = await isFeatureEnabled("messaging_enabled");
  const conversations = messagingEnabled
    ? await listConversationsForAccount(account.id)
    : [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Messages
        </h1>
        <p className="mt-2 text-[var(--color-text-slate)]">
          Private conversations with your connections.
        </p>
      </div>

      {!messagingEnabled && (
        <Alert variant="info">
          Messaging is rolling out gradually.{" "}
          <Link href="/connections" className="underline">
            Connections
          </Link>{" "}
          are ready when you are.
        </Alert>
      )}

      {messagingEnabled && <ConversationList items={conversations} />}
    </div>
  );
}
