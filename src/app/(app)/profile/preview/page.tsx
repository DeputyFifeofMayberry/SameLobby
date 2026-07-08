import Link from "next/link";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { requireAccount } from "@/domains/accounts/queries";
import { getCurrentIntent, getGamerProfileForAccount } from "@/domains/profile/queries";
import { getUserGamesForAccount } from "@/domains/games/queries";
import { TIME_ZONE_OPTIONS } from "@/lib/timezones";
import { redirect } from "next/navigation";

export default async function ProfilePreviewPage() {
  const account = await requireAccount();
  const [profile, userGames, currentIntent] = await Promise.all([
    getGamerProfileForAccount(account.id),
    getUserGamesForAccount(account.id),
    getCurrentIntent(account.id),
  ]);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/preview");
  }

  const timeZoneLabel =
    TIME_ZONE_OPTIONS.find((tz) => tz.value === account.time_zone)?.label ??
    account.time_zone ??
    "";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Discoverable preview
        </h1>
        <p className="mt-2 text-[var(--color-text-slate)]">
          What eligible SameLobby members see when your profile is discoverable.
        </p>
      </div>
      <ProfilePreview
        displayName={profile.display_name ?? "Player"}
        timeZoneLabel={timeZoneLabel}
        userGames={userGames}
        communicationModes={profile.communication_modes}
        goal={currentIntent?.goal ?? null}
      />
      <Link
        href="/profile"
        className="inline-block text-sm text-[var(--color-lobby-teal)] underline"
      >
        Edit profile
      </Link>
    </div>
  );
}
