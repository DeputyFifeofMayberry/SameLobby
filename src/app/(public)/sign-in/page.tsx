import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
};

type SignInPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Sign in to SameLobby
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-slate)]">
        Welcome back. Sign in with your email and password.
      </p>
      <div className="mt-8">
        <SignInForm next={params.next} authError={params.error === "auth"} />
      </div>
    </main>
  );
}
