"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  type AuthActionResult,
} from "@/domains/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";

const initial: AuthActionResult | null = null;

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initial,
  );

  if (state?.ok) {
    return (
      <Alert variant="success" role="status">
        If an account exists for that email, we sent password reset
        instructions.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
        />
      </div>
      {state && !state.ok && (
        <Alert variant="error" role="alert">
          {state.error}
        </Alert>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-sm text-[var(--color-text-slate)]">
        <Link
          href="/sign-in"
          className="text-[var(--color-lobby-teal)] underline"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
