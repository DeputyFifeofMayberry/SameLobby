"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  signInWithPassword,
  type AuthActionResult,
} from "@/domains/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";

const initial: AuthActionResult | null = null;

type SignInFormProps = {
  next?: string;
  authError?: boolean;
};

export function SignInForm({ next, authError }: SignInFormProps) {
  const [state, formAction, pending] = useActionState(
    signInWithPassword,
    initial,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {authError && (
        <Alert variant="error" role="alert">
          Sign-in link expired or was invalid. Please try again.
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
          disabled={pending}
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
        />
      </div>
      <p className="text-sm">
        <Link
          href="/forgot-password"
          className="text-[var(--color-lobby-teal)] underline"
        >
          Forgot password?
        </Link>
      </p>
      {state && !state.ok && (
        <Alert variant="error" role="alert">
          {state.error}
        </Alert>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-sm text-[var(--color-text-slate)]">
        New here?{" "}
        <Link
          href="/sign-up"
          className="text-[var(--color-lobby-teal)] underline"
        >
          Create an account
        </Link>
      </p>
      <p className="text-sm text-[var(--color-text-slate)]">
        For gamers 18+. Platonic gaming friends and teammates.
      </p>
    </form>
  );
}
