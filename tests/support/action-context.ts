import type { Session } from "@supabase/supabase-js";

export type RedirectCapture = { path: string | null };

export type CacheCall = { tags: string[]; kind: "revalidate" | "update" };

export type ActionContextMocks = {
  cookies: Map<string, string>;
  headers: Map<string, string>;
  redirect: RedirectCapture;
  cacheCalls: CacheCall[];
};

export function createActionContextMocks(): ActionContextMocks {
  return {
    cookies: new Map(),
    headers: new Map(),
    redirect: { path: null },
    cacheCalls: [],
  };
}

/**
 * Skeleton for invoking server actions with Next.js request primitives mocked.
 * Phase 1: registry only; full wiring lands with integration suites.
 */
export async function invokeServerAction<T>(
  _handler: (input: unknown) => Promise<T>,
  _input: unknown,
  _session?: Session,
  mocks: ActionContextMocks = createActionContextMocks(),
): Promise<{ result: T | null; mocks: ActionContextMocks }> {
  return { result: null, mocks };
}
