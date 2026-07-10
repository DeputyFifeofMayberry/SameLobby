import { spawnSync } from "node:child_process";
import { assertTestGuards } from "../tests/support/guards";

const args = process.argv.slice(2);
const separatorIndex = args.indexOf("--");

if (separatorIndex === -1 || separatorIndex === args.length - 1) {
  console.error("Usage: tsx scripts/run-with-local-supabase.ts -- <vitest args>");
  process.exit(1);
}

function exportLocalSupabaseEnv(): void {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return;

  const status = spawnSync("npx", ["supabase", "status", "-o", "json"], {
    encoding: "utf8",
    shell: true,
  });
  if (status.status !== 0 || !status.stdout) {
    throw new Error(
      "Local Supabase is not running. Start it with `npx supabase start` before api/integration tests.",
    );
  }

  const parsed = JSON.parse(status.stdout) as {
    API_URL?: string;
    ANON_KEY?: string;
    SERVICE_ROLE_KEY?: string;
  };

  process.env.NEXT_PUBLIC_SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? parsed.API_URL;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? parsed.ANON_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? parsed.SERVICE_ROLE_KEY;
  process.env.SUPABASE_PROJECT_ID =
    process.env.SUPABASE_PROJECT_ID ?? "SameLobby";
}

exportLocalSupabaseEnv();
process.env.ALLOW_DESTRUCTIVE_TESTS = "true";
process.env.SKIP_ENV_VALIDATION = "true";
assertTestGuards();

const vitestArgs = args.slice(separatorIndex + 1);
const result = spawnSync("npx", vitestArgs, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
