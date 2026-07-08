import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Reset your password
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-slate)]">
        Enter your email and we&apos;ll send reset instructions.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
