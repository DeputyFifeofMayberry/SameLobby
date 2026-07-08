import { redirect } from "next/navigation";
import {
  getAccountForUser,
  getSessionUser,
} from "@/domains/accounts/queries";

export default async function DiscoverPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const account = await getAccountForUser(user.id);
  if (!account || account.status === "onboarding") {
    redirect("/onboarding/attestation");
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Discover
      </h1>
      <p className="mt-2 text-[var(--color-text-slate)]">
        Slice 1 foundation is ready. Discovery, recommendations, and search ship
        in Slice 3.
      </p>
      <div className="mt-8 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-slate)]">
        Authenticated shell · Account status: {account.status}
      </div>
    </div>
  );
}
