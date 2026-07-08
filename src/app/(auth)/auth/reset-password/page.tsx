import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set new password",
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Set a new password
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-slate)]">
        Choose a new password for your account.
      </p>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </main>
  );
}
