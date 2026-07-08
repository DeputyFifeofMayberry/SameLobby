import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Check your email",
};

export default function CheckEmailPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Check your email
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-slate)]">
        We sent a confirmation link. Click it to activate your account, then
        you&apos;ll continue to onboarding.
      </p>
      <p className="mt-6 text-sm text-[var(--color-text-slate)]">
        <Link
          href="/sign-in"
          className="text-[var(--color-lobby-teal)] underline"
        >
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
