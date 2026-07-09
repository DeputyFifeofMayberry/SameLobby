"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { syncAdminMfaEnrolled } from "@/domains/admin/actions";

export function AdminMfaGate() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Admin MFA required
      </h1>
      <Alert variant="info">
        Enroll multi-factor authentication in your account security settings,
        complete verification in this session (AAL2), then confirm enrollment
        here to access the admin console.
      </Alert>
      {confirmed && (
        <Alert variant="success" role="status">
          MFA enrollment confirmed. Continue to the admin console.
        </Alert>
      )}
      {error && (
        <Alert variant="error" role="alert">
          {error}
        </Alert>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await syncAdminMfaEnrolled();
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setConfirmed(true);
              router.refresh();
            })
          }
        >
          {pending ? "Confirming…" : "I have enrolled MFA"}
        </Button>
        {confirmed && (
          <Button type="button" variant="secondary" onClick={() => router.refresh()}>
            Continue to admin
          </Button>
        )}
      </div>
    </div>
  );
}
