/**
 * Regenerates Supabase TypeScript types and fails when they differ from committed files.
 * See SAMELOBBY_TEST_IMPLEMENTATION_BUILD_PLAN.md §L.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const TYPES_DIR = join(ROOT, "src/lib/supabase");
const TYPES_PATH = join(TYPES_DIR, "database.types.ts");
const GENERATED_PATH = join(ROOT, ".cache/database.types.generated.ts");

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
      "Local Supabase is not running. Start it with `npx supabase start` before types checks.",
    );
  }
}

function generateTypes(): string {
  const gen = run("npx", [
    "supabase",
    "gen",
    "types",
    "typescript",
    "--local",
    "--schema",
    "public",
  ]);
  if (gen.status !== 0) {
    console.error(gen.stderr || gen.stdout);
    throw new Error("supabase gen types failed");
  }
  if (!gen.stdout.trim()) {
    throw new Error("supabase gen types returned empty output");
  }
  return `${gen.stdout.trimEnd()}\n`;
}

function main(): void {
  assertSupabaseRunning();
  mkdirSync(join(ROOT, ".cache"), { recursive: true });
  mkdirSync(TYPES_DIR, { recursive: true });

  const generated = generateTypes();
  writeFileSync(GENERATED_PATH, generated, "utf8");

  if (!existsSync(TYPES_PATH)) {
    writeFileSync(TYPES_PATH, generated, "utf8");
    console.log(`check-generated-types: created ${TYPES_PATH}`);
    return;
  }

  const committed = readFileSync(TYPES_PATH, "utf8");
  if (committed !== generated) {
    console.error(
      "Generated Supabase types differ from src/lib/supabase/database.types.ts",
    );
    console.error("Run: npx supabase gen types typescript --local --schema public > src/lib/supabase/database.types.ts");
    process.exit(1);
  }

  console.log("check-generated-types: database.types.ts is current");
}

main();
