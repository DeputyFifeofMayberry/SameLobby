import { IdentityStepForm } from "@/components/onboarding/IdentityStepForm";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { redirect } from "next/navigation";

export default async function IdentityOnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const account = await getAccountForUser(user.id);
  const profile = account
    ? await getGamerProfileForAccount(account.id)
    : null;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Create your profile
      </h1>
      <p className="mt-2 text-[var(--color-text-slate)]">
        Choose a display name and time zone. No real name required.
      </p>
      <div className="mt-8">
        <IdentityStepForm
          defaultDisplayName={profile?.display_name ?? ""}
          defaultTimeZone={account?.time_zone ?? ""}
        />
      </div>
    </div>
  );
}
