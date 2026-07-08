import Link from "next/link";
import { ProfileIdentityForm } from "@/components/profile/ProfileIdentityForm";
import { ProfileCommunicationForm } from "@/components/profile/ProfileCommunicationForm";
import { ProfilePreview } from "@/components/profile/ProfilePreview";
import { VisibilitySelector } from "@/components/profile/VisibilitySelector";
import { requireAccount } from "@/domains/accounts/queries";
import {
  getCurrentIntent,
  getDisclosureSettings,
  getGamerProfileForAccount,
} from "@/domains/profile/queries";
import { getUserGamesForAccount } from "@/domains/games/queries";
import { TIME_ZONE_OPTIONS } from "@/lib/timezones";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const account = await requireAccount();
  if (!account.time_zone && account.status === "active") {
    redirect("/onboarding/identity");
  }

  const [profile, userGames, currentIntent, disclosureSettings] =
    await Promise.all([
      getGamerProfileForAccount(account.id),
      getUserGamesForAccount(account.id),
      getCurrentIntent(account.id),
      getDisclosureSettings(account.id),
    ]);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  const timeZoneLabel =
    TIME_ZONE_OPTIONS.find((tz) => tz.value === account.time_zone)?.label ??
    account.time_zone ??
    "";

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Your profile
        </h1>
        <p className="mt-2 text-[var(--color-text-slate)]">
          Update discoverable details and privacy controls.
        </p>
        <p className="mt-2">
          <Link
            href="/profile/preview"
            className="text-sm text-[var(--color-lobby-teal)] underline"
          >
            View discoverable preview
          </Link>
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Identity</h2>
        <ProfileIdentityForm
          defaultDisplayName={profile.display_name ?? ""}
          defaultTimeZone={account.time_zone ?? ""}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Communication</h2>
        <ProfileCommunicationForm
          defaultModes={profile.communication_modes ?? []}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Visibility</h2>
        <ul className="space-y-3 text-sm">
          {disclosureSettings.map((setting) => (
            <li
              key={setting.id}
              className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium">{setting.field_key}</span>
              <VisibilitySelector
                fieldKey={setting.field_key}
                current={setting.visibility}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Summary</h2>
        <ProfilePreview
          displayName={profile.display_name ?? "Player"}
          timeZoneLabel={timeZoneLabel}
          userGames={userGames}
          communicationModes={profile.communication_modes}
          goal={currentIntent?.goal ?? null}
        />
      </section>
    </div>
  );
}
