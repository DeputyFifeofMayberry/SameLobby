/**
 * Scans CI artifact directories for likely secrets before upload.
 * See SAMELOBBY_TEST_IMPLEMENTATION_BUILD_PLAN.md §L.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const DEFAULT_PATHS = [
  "coverage",
  "test-results",
  "playwright-report",
  "blob-report",
];

const SENSITIVE_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: "jwt", pattern: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ },
  {
    name: "service_role_key",
    pattern: /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*['"]?[A-Za-z0-9._-]{20,}/i,
  },
  {
    name: "stripe_secret",
    pattern: /\bsk_(live|test)_[A-Za-z0-9]{16,}\b/,
  },
  {
    name: "resend_key",
    pattern: /\bre_[A-Za-z0-9]{20,}\b/,
  },
];

type Finding = { path: string; rule: string };

function collectFiles(dir: string, files: string[] = []): string[] {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) {
    return files;
  }
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectFiles(full, files);
    } else if (stat.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function scanFile(path: string): Finding[] {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return [];
  }
  if (text.includes("\u0000")) {
    return [];
  }

  const findings: Finding[] = [];
  for (const rule of SENSITIVE_PATTERNS) {
    if (rule.pattern.test(text)) {
      findings.push({ path, rule: rule.name });
    }
  }
  return findings;
}

function main(): void {
  const targets = process.argv.slice(2);
  const paths = targets.length > 0 ? targets : DEFAULT_PATHS.map((p) => join(ROOT, p));

  const findings: Finding[] = [];
  for (const path of paths) {
    for (const file of collectFiles(path)) {
      findings.push(...scanFile(file));
    }
  }

  if (findings.length > 0) {
    console.error("scan-artifacts-for-secrets: possible secrets found:");
    for (const finding of findings) {
      console.error(`  - ${finding.rule}: ${finding.path}`);
    }
    process.exit(1);
  }

  console.log("scan-artifacts-for-secrets: no sensitive patterns detected");
}

main();
