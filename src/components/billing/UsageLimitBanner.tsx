import Link from "next/link";
import { Alert } from "@/components/ui/Alert";

type UsageLimitBannerProps = {
  feature: "games" | "groups" | "saved_searches";
  stripeEnabled: boolean;
};

const COPY: Record<UsageLimitBannerProps["feature"], string> = {
  games:
    "You've reached the Free limit for active games. Upgrade for organization tools — not more visibility.",
  groups:
    "You've reached the Free limit for private groups. Upgrade for organization tools — not more visibility.",
  saved_searches:
    "Saved searches are a Plus feature. Upgrade for organization tools — not more visibility.",
};

export function UsageLimitBanner({
  feature,
  stripeEnabled,
}: UsageLimitBannerProps) {
  return (
    <Alert variant="info">
      {COPY[feature]}{" "}
      {stripeEnabled ? (
        <Link href="/subscription" className="underline">
          View plans
        </Link>
      ) : (
        "Subscriptions are rolling out soon."
      )}
    </Alert>
  );
}
