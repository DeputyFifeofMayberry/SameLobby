import { PreviewStepForm } from "@/components/onboarding/PreviewStepForm";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { getCurrentIntent, getGamerProfileForAccount } from "@/domains/profile/queries";
import { getUserGamesForAccount } from "@/domains/games/queries";
import { TIME_ZONE_OPTIONS } from "@/lib/timezones";
import { redirect } from "next/navigation";

export default async function PreviewOnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const account = await getAccountForUser(user.id);
  if (!account) redirect("/sign-in");

  const [profile, userGames, currentIntent] = await Promise.all([
    getGamerProfileForAccount(account.id),
    getUserGamesForAccount(account.id),
    getCurrentIntent(account.id),
  ]);

  const timeZoneLabel =
    TIME_ZONE_OPTIONS.find((tz) => tz.value === account.time_zone)?.label ??
    account.time_zone ??
    "Time zone not set";

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Profile preview
      </h1>
      <p className="mt-2 text-[var(--color-text-slate)]">
        This is how discoverable members will see your profile.
      </p>
      <div className="mt-8">
        <PreviewStepForm
          displayName={profile?.display_name ?? "Your name"}
          timeZoneLabel={timeZoneLabel}
          userGames={userGames}
          communicationModes={profile?.communication_modes ?? []}
          goal={currentIntent?.goal ?? null}
        />
      </div>
    </div>
  );
}
