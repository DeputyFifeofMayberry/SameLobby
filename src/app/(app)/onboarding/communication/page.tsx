import { CommunicationStepForm } from "@/components/onboarding/CommunicationStepForm";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { redirect } from "next/navigation";

export default async function CommunicationOnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const account = await getAccountForUser(user.id);
  const profile = account
    ? await getGamerProfileForAccount(account.id)
    : null;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        How you communicate
      </h1>
      <p className="mt-2 text-[var(--color-text-slate)]">
        Choose at least one way you can coordinate with teammates.
      </p>
      <div className="mt-8">
        <CommunicationStepForm
          defaultModes={profile?.communication_modes ?? []}
        />
      </div>
    </div>
  );
}
