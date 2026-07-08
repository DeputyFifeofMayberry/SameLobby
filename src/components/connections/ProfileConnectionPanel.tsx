import Link from "next/link";
import { ConnectionRequestForm } from "@/components/connections/ConnectionRequestForm";
import { BlockUserButton } from "@/components/connections/BlockUserButton";
import { Alert } from "@/components/ui/Alert";
import { getRelationshipState } from "@/domains/connections/queries";
import { isFeatureEnabled } from "@/lib/feature-flags";

type ProfileConnectionPanelProps = {
  viewerAccountId: string;
  targetAccountId: string;
  targetDisplayName: string;
};

export async function ProfileConnectionPanel({
  viewerAccountId,
  targetAccountId,
  targetDisplayName,
}: ProfileConnectionPanelProps) {
  const [requestsEnabled, relationship] = await Promise.all([
    isFeatureEnabled("connection_requests_enabled"),
    getRelationshipState(viewerAccountId, targetAccountId),
  ]);

  return (
    <section className="space-y-4">
      {!requestsEnabled && (
        <Alert variant="info">
          Connection requests are rolling out soon.
        </Alert>
      )}

      {requestsEnabled && relationship === "none" && (
        <ConnectionRequestForm
          recipientAccountId={targetAccountId}
          recipientDisplayName={targetDisplayName}
        />
      )}

      {requestsEnabled && relationship === "pending_outgoing" && (
        <Alert variant="info">
          Request sent. Track it on{" "}
          <Link href="/connections" className="underline">
            Connections
          </Link>
          .
        </Alert>
      )}

      {requestsEnabled && relationship === "pending_incoming" && (
        <Alert variant="info">
          This player sent you a request. Review it on{" "}
          <Link href="/connections" className="underline">
            Connections
          </Link>
          .
        </Alert>
      )}

      {relationship === "connected" && (
        <Alert variant="success">
          You are connected. Messaging ships in the next slice.
        </Alert>
      )}

      {relationship === "blocked" && (
        <Alert variant="info">This profile is not available.</Alert>
      )}

      {relationship !== "blocked" && (
        <div className="flex justify-end">
          <BlockUserButton
            targetAccountId={targetAccountId}
            targetDisplayName={targetDisplayName}
          />
        </div>
      )}
    </section>
  );
}
