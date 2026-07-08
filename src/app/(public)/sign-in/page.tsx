import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
  const registrationOpen = await isFeatureEnabled("registration_open");

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Sign in to SameLobby
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-slate)]">
        We&apos;ll email you a magic link. No password required.
      </p>
      {!registrationOpen && (
        <Alert variant="info" className="mt-4" role="alert">
          New registration is temporarily paused. Existing members can still sign
          in.
        </Alert>
      )}
      <div className="mt-8">
        <SignInForm />
      </div>
    </main>
  );
}
