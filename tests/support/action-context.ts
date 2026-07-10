import type { Session } from "@supabase/supabase-js";

export type RedirectCapture = { path: string | null };

export type CacheCall = { tags: string[]; kind: "revalidate" | "update" };

export type ActionContextMocks = {
  cookies: Map<string, string>;
  headers: Map<string, string>;
  redirect: RedirectCapture;
  cacheCalls: CacheCall[];
};

export type InvokeServerActionResult<T> = {
  result: T | null;
  mocks: ActionContextMocks;
  redirectPath: string | null;
  error: unknown | null;
};

export function createActionContextMocks(): ActionContextMocks {
  return {
    cookies: new Map(),
    headers: new Map(),
    redirect: { path: null },
    cacheCalls: [],
  };
}

export function captureRedirectPath(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const digest = (error as { digest?: string }).digest;
  if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT;")) {
    const parts = digest.split(";");
    return parts[2] ?? null;
  }
  const message = (error as { message?: string }).message;
  if (typeof message === "string" && message.startsWith("NEXT_REDIRECT")) {
    return message.split(";")[2] ?? null;
  }
  return null;
}

/**
 * Invokes a server action handler while capturing redirect-style failures.
 * Full Next.js cookie/header wiring lands with domain integration suites.
 */
export async function invokeServerAction<T>(
  handler: (input: unknown) => Promise<T>,
  input: unknown,
  _session?: Session,
  mocks: ActionContextMocks = createActionContextMocks(),
): Promise<InvokeServerActionResult<T>> {
  try {
    const result = await handler(input);
    return { result, mocks, redirectPath: null, error: null };
  } catch (error) {
    const redirectPath = captureRedirectPath(error);
    if (redirectPath) {
      mocks.redirect.path = redirectPath;
      return { result: null, mocks, redirectPath, error: null };
    }
    return { result: null, mocks, redirectPath: null, error };
  }
}
