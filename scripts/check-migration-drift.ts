/**
 * Fails when local migrations drift from the linked database or generated types are stale.
 * See SAMELOBBY_TEST_IMPLEMENTATION_BUILD_PLAN.md §L.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CACHE_DIR = join(ROOT, ".cache");
const DIFF_PATH = join(CACHE_DIR, "migration-drift.sql");

function run(command: string, args: string[]): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function assertSupabaseRunning(): void {
  const status = run("npx", ["supabase", "status", "-o", "json"]);
  if (status.status !== 0) {
    console.error(status.stderr || status.stdout);
    throw new Error(
      "Local Supabase is not running. Start it with `npx supabase start` before migration-drift checks.",
    );
  }
}

function normalizeDiff(sql: string): string {
  return sql
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => {
      if (!line) return false;
      if (line.startsWith("--")) return false;
      if (line.startsWith("SET ")) return false;
      if (line.startsWith("SELECT pg_catalog")) return false;
      return true;
    })
    .join("\n")
    .trim();
}

function checkSchemaDiff(): void {
  mkdirSync(CACHE_DIR, { recursive: true });
  if (existsSync(DIFF_PATH)) {
    writeFileSync(DIFF_PATH, "", "utf8");
  }

  const diff = run("npx", [
    "supabase",
    "db",
    "diff",
    "--local",
    "--schema",
    "public,auth",
    "--file",
    DIFF_PATH,
  ]);
  if (diff.status !== 0) {
    console.error(diff.stderr || diff.stdout);
    throw new Error("supabase db diff failed");
  }

  if (!existsSync(DIFF_PATH)) {
    console.log("check-migration-drift: schema matches migrations");
    return;
  }

  const normalized = normalizeDiff(readFileSync(DIFF_PATH, "utf8"));
  if (normalized.length > 0) {
    console.error("Schema drift detected. Review .cache/migration-drift.sql:");
    console.error(normalized);
    throw new Error("Migration drift: local database does not match migration files");
  }
  console.log("check-migration-drift: schema matches migrations");
}

function main(): void {
  assertSupabaseRunning();
  checkSchemaDiff();
}

main();
