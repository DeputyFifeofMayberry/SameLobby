import Link from "next/link";
import { ConnectionRequestForm } from "@/components/connections/ConnectionRequestForm";
import { BlockUserButton } from "@/components/connections/BlockUserButton";
import { ReportEntry } from "@/components/moderation/ReportEntry";
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
          You are connected.{" "}
          <Link href="/messages" className="underline">
            Open Messages
          </Link>{" "}
          to chat.
        </Alert>
      )}

      {relationship === "blocked" && (
        <Alert variant="info">This profile is not available.</Alert>
      )}

      {relationship !== "blocked" && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ReportEntry
            reportedAccountId={targetAccountId}
            reportedDisplayName={targetDisplayName}
          />
          <BlockUserButton
            targetAccountId={targetAccountId}
            targetDisplayName={targetDisplayName}
          />
        </div>
      )}
    </section>
  );
}
