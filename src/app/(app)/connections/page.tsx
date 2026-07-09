import Link from "next/link";
import { redirect } from "next/navigation";
import { ConnectionListItem } from "@/components/connections/ConnectionListItem";
import { ConnectionRequestCard } from "@/components/connections/ConnectionRequestCard";
import { Alert } from "@/components/ui/Alert";
import { requireAccount } from "@/domains/accounts/queries";
import {
  getActiveConnections,
  getIncomingRequests,
  getOutgoingRequests,
} from "@/domains/connections/queries";
import { getConversationIdsForConnections } from "@/domains/messaging/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

export default async function ConnectionsPage() {
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const requestsEnabled = await isFeatureEnabled("connection_requests_enabled");
  const reportingEnabled = await isFeatureEnabled("reporting_enabled");

  const [incoming, outgoing, connections] = requestsEnabled
    ? await Promise.all([
        getIncomingRequests(account.id),
        getOutgoingRequests(account.id),
        getActiveConnections(account.id),
      ])
    : [[], [], []];

  const conversationByConnection =
    requestsEnabled && (await isFeatureEnabled("messaging_enabled"))
      ? await getConversationIdsForConnections(connections.map((c) => c.id))
      : new Map<string, string>();

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Connections
        </h1>
        <p className="mt-2 text-[var(--color-text-slate)]">
          Mutual consent before messaging. Declines stay private.
        </p>
      </div>

      {!requestsEnabled && (
        <Alert variant="info">
          Connection requests are rolling out gradually. Browse{" "}
          <Link href="/discover" className="underline">
            Discover
          </Link>{" "}
          to find players in the meantime.
        </Alert>
      )}

      {requestsEnabled && (
        <>
          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              Incoming requests
            </h2>
            {incoming.length === 0 ? (
              <p className="text-sm text-[var(--color-text-slate)]">
                No pending requests. Browse{" "}
                <Link href="/discover" className="text-[var(--color-lobby-teal)] underline">
                  Discover
                </Link>{" "}
                to find gamers.
              </p>
            ) : (
              <ul className="space-y-4">
                {incoming.map((request) => (
                  <li key={request.id}>
                    <ConnectionRequestCard
                      request={request}
                      reportingEnabled={reportingEnabled}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              Sent requests
            </h2>
            {outgoing.filter((r) => r.status === "pending").length === 0 ? (
              <p className="text-sm text-[var(--color-text-slate)]">No sent requests yet.</p>
            ) : (
              <ul className="space-y-4">
                {outgoing
                  .filter((r) => r.status === "pending")
                  .map((request) => (
                    <li key={request.id}>
                      <ConnectionRequestCard
                      request={request}
                      reportingEnabled={reportingEnabled}
                    />
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
              Connected
            </h2>
            {connections.length === 0 ? (
              <p className="text-sm text-[var(--color-text-slate)]">
                No connections yet. Send a request from someone&apos;s profile.
              </p>
            ) : (
              <ul className="space-y-4">
                {connections.map((connection) => (
                  <li key={connection.id}>
                    <ConnectionListItem
                      connection={connection}
                      conversationId={conversationByConnection.get(connection.id)}
                    />
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
