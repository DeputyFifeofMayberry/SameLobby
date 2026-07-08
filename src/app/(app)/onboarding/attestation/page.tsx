import { AttestationForm } from "@/components/accounts/AttestationForm";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { redirect } from "next/navigation";

export default async function AttestationPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const account = await getAccountForUser(user.id);
  if (account?.status === "active" && account.adult_attested_at) {
    const profile = await getGamerProfileForAccount(account.id);
    if (profile?.onboarding_completed_at) {
      redirect("/discover");
    }
    redirect("/onboarding/identity");
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Welcome to SameLobby
      </h1>
      <p className="mt-2 max-w-lg text-[var(--color-text-slate)]">
        Before you continue, confirm that you are 18 or older and accept our
        policies. Public age disclosure is never required.
      </p>
      <div className="mt-8">
        <AttestationForm />
      </div>
    </div>
  );
}
