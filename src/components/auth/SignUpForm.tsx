"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  signUpWithPassword,
  type AuthActionResult,
} from "@/domains/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";

const initial: AuthActionResult | null = null;

type SignUpFormProps = {
  registrationOpen: boolean;
};

export function SignUpForm({ registrationOpen }: SignUpFormProps) {
  const [state, formAction, pending] = useActionState(
    signUpWithPassword,
    initial,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {!registrationOpen && (
        <Alert variant="info" role="alert">
          New registration is temporarily paused. Check back soon.
        </Alert>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={!registrationOpen || pending}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          disabled={!registrationOpen || pending}
        />
        <p className="mt-1 text-xs text-[var(--color-text-slate)]">
          At least 8 characters with letters and numbers.
        </p>
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          disabled={!registrationOpen || pending}
        />
      </div>
      {state && !state.ok && (
        <Alert variant="error" role="alert">
          {state.error}
        </Alert>
      )}
      <Button
        type="submit"
        disabled={!registrationOpen || pending}
        className="w-full"
      >
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-sm text-[var(--color-text-slate)]">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-[var(--color-lobby-teal)] underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
