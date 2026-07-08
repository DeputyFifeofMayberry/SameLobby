import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { isFeatureEnabled } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignUpPage() {
  const registrationOpen = await isFeatureEnabled("registration_open");

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Create your SameLobby account
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-slate)]">
        For gamers 18+. Platonic gaming friends and teammates — not dating.
      </p>
      <div className="mt-8">
        <SignUpForm registrationOpen={registrationOpen} />
      </div>
    </main>
  );
}
