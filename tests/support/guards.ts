const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const EXPECTED_PROJECT_ID = "SameLobby";

export function assertLocalSupabase(url?: string): void {
  const target = url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!target) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for destructive test suites");
  }
  const host = new URL(target).hostname;
  if (!LOCALHOST_HOSTS.has(host)) {
    throw new Error(
      `Supabase URL must target localhost for destructive tests (got ${host})`,
    );
  }
}

export function assertDestructiveTestsAllowed(): void {
  if (process.env.ALLOW_DESTRUCTIVE_TESTS !== "true") {
    throw new Error(
      "ALLOW_DESTRUCTIVE_TESTS=true is required for api/integration/coverage suites",
    );
  }
}

export function assertLocalProjectId(projectId?: string): void {
  const resolved = projectId ?? process.env.SUPABASE_PROJECT_ID ?? EXPECTED_PROJECT_ID;
  if (resolved !== EXPECTED_PROJECT_ID) {
    throw new Error(
      `Expected local Supabase project_id ${EXPECTED_PROJECT_ID}, got ${resolved}`,
    );
  }
}

export function assertTestGuards(options?: { supabaseUrl?: string }): void {
  assertLocalSupabase(options?.supabaseUrl);
  assertDestructiveTestsAllowed();
  assertLocalProjectId();
}
