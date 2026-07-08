import Link from "next/link";
import { requireAccount } from "@/domains/accounts/queries";
import { getGamerProfileForAccount } from "@/domains/profile/queries";
import { redirect } from "next/navigation";

export default async function DiscoverPage() {
  const account = await requireAccount();
  const profile = await getGamerProfileForAccount(account.id);

  if (!profile?.onboarding_completed_at) {
    redirect("/onboarding/identity");
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Discover
      </h1>
      <p className="mt-2 text-[var(--color-text-slate)]">
        Your profile is ready. Discovery recommendations and search ship in
        Slice 3.
      </p>
      <div className="mt-8 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-slate)]">
        <p>Authenticated shell · Profile complete</p>
        <p className="mt-4">
          <Link href="/profile" className="text-[var(--color-lobby-teal)] underline">
            Review your profile
          </Link>
        </p>
      </div>
    </div>
  );
}
