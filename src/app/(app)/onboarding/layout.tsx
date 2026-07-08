import { headers } from "next/headers";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const account = await getAccountForUser(user.id);
  const profile = account
    ? await getGamerProfileForAccount(account.id)
    : null;

  const step = profile?.onboarding_step ?? "identity";
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (pathname.includes("/onboarding/attestation")) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <OnboardingProgress step={step} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
