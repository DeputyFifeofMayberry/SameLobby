import { ReportForm } from "@/components/messaging/ReportForm";
import { Alert } from "@/components/ui/Alert";
import { isFeatureEnabled } from "@/lib/feature-flags";

type ReportEntryProps = {
  reportedAccountId: string;
  reportedDisplayName: string;
  conversationId?: string;
  groupId?: string;
  playInvitationId?: string;
  showMessageContextOption?: boolean;
};

export async function ReportEntry(props: ReportEntryProps) {
  const enabled = await isFeatureEnabled("reporting_enabled");
  if (!enabled) {
    return (
      <Alert variant="info">
        Reporting is not available yet. You can still block users from your
        profile or chat.
      </Alert>
    );
  }
  return <ReportForm {...props} />;
}
