"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";
import { checkRateLimit } from "@/lib/rate-limit";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    const limit = checkRateLimit(`sign-in:${trimmed}`, 5, 60_000);
    if (!limit.allowed) {
      setError("Too many attempts. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
      },
    });
    setLoading(false);

    if (signInError) {
      setError("Could not send sign-in link. Try again.");
      return;
    }

    setMessage("Check your email for a magic link to sign in.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={error ? "sign-in-error" : undefined}
        />
      </div>
      {error && (
        <Alert variant="error" role="alert" id="sign-in-error">
          {error}
        </Alert>
      )}
      {message && <Alert variant="success">{message}</Alert>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending…" : "Send magic link"}
      </Button>
      <p className="text-sm text-[var(--color-text-slate)]">
        For gamers 18+. Platonic gaming friends and teammates.
      </p>
    </form>
  );
}
