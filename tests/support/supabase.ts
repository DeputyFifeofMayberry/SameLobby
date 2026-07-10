import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

const localAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const localServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

function supabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
}

function anonClient(): SupabaseClient {
  return createClient(
    supabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? localAnonKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Anonymous auth client for registration and public auth flows.
 */
export function createAnonAuthClient(): SupabaseClient {
  return anonClient();
}

/**
 * Service-role client for fixture seeding and teardown only — not an authenticated actor.
 */
export function createFixtureAdmin(): SupabaseClient {
  return createClient(supabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY ?? localServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * User-scoped client for RLS-proving tests. Pass null for anonymous actors.
 */
export async function createActorClient(
  session: Session | null,
): Promise<SupabaseClient> {
  const client = createClient(
    supabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? localAnonKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  if (session) {
    const { error } = await client.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (error) {
      throw new Error(`createActorClient setSession failed: ${error.message}`);
    }
  }
  return client;
}

/**
 * T006 and actor integration — password auth through Supabase API (not browser UI).
 */
export async function signInWithPasswordThroughApi(
  email: string,
  password: string,
): Promise<Session> {
  const { data, error } = await anonClient().auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) {
    throw new Error(
      `signInWithPasswordThroughApi failed: ${JSON.stringify(error ?? "no session")}`,
    );
  }
  return data.session;
}

/**
 * Password API session for non-auth journeys and integration actors.
 */
export async function createAuthenticatedFixtureSession(
  email: string,
  password: string,
): Promise<Session> {
  return signInWithPasswordThroughApi(email, password);
}
