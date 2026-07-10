/**
 * Traceability verifier for SameLobby test program.
 * Modes: plan | phase | release
 *
 * Usage:
 *   npx tsx scripts/verify-test-traceability.ts --mode=plan
 *   npx tsx scripts/verify-test-traceability.ts --mode=phase --phase=2
 *   npx tsx scripts/verify-test-traceability.ts --mode=release
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const INVENTORY_PATH = join(ROOT, "tests/test-inventory.json");
const ANCHORS_PATH = join(ROOT, "docs/testing/canonical-anchors.md");
const DECISIONS_PATH = join(ROOT, "docs/testing/product-decisions.json");
const GEN_DIR = join(ROOT, "docs/testing/generated");
const GEN_HEADER = "Generated from tests/test-inventory.json — do not edit";

type Implementation = {
  key: string;
  layer: string;
  file: string;
  phase: number;
  package: string;
  baselineStatus: string;
  implementationStatus: string;
  disposition: string;
  decisions: string[];
  defects: string[];
  contractRef: string | null;
  setupRef: string;
  stepsRef: string;
  expectedRef: string;
  titleMarker: string;
  owner: string;
  devCommand: string;
  suiteCommand: string;
  acceptanceCommand: string;
};

type Requirement = {
  id: string;
  priority: string;
  canonicalHeadingId: string;
  implementations: Implementation[];
};

type Inventory = {
  schemaVersion: number;
  baselineSha: string;
  requirements: Requirement[];
};

const PLACEHOLDER_RE = /\b(maybe|likely|TBD)\b/i;

function parseArgs(argv: string[]) {
  let mode: "plan" | "phase" | "release" = "plan";
  let phase: number | null = null;
  let shouldWriteGenerated = false;
  for (const arg of argv) {
    if (arg.startsWith("--mode=")) mode = arg.split("=")[1] as typeof mode;
    if (arg.startsWith("--phase=")) phase = Number(arg.split("=")[1]);
    if (arg === "--write-generated") shouldWriteGenerated = true;
  }
  return { mode, phase, shouldWriteGenerated };
}

function loadInventory(): Inventory {
  return JSON.parse(readFileSync(INVENTORY_PATH, "utf8")) as Inventory;
}

function fragmentExists(anchors: string, ref: string): boolean {
  const hash = ref.split("#")[1];
  if (!hash) return false;
  return anchors.includes(`id="${hash}"`);
}

function validateInventoryStructure(inv: Inventory, errors: string[]) {
  if (inv.schemaVersion !== 2)
    errors.push(`schemaVersion must be 2, got ${inv.schemaVersion}`);
  if (!inv.baselineSha) errors.push("baselineSha is required");
  if (inv.requirements.length !== 120) {
    errors.push(`expected 120 requirements, got ${inv.requirements.length}`);
  }

  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  for (const req of inv.requirements) {
    if (!/^SL-T\d{3}$/.test(req.id))
      errors.push(`invalid requirement id: ${req.id}`);
    if (seenIds.has(req.id)) errors.push(`duplicate requirement id: ${req.id}`);
    seenIds.add(req.id);
    if (req.implementations.length === 0)
      errors.push(`${req.id} has no implementations`);

    for (const impl of req.implementations) {
      if (seenKeys.has(impl.key))
        errors.push(`duplicate implementation key: ${impl.key}`);
      seenKeys.add(impl.key);
      const requiredFields: (keyof Implementation)[] = [
        "key",
        "layer",
        "file",
        "phase",
        "package",
        "baselineStatus",
        "implementationStatus",
        "disposition",
        "decisions",
        "defects",
        "setupRef",
        "stepsRef",
        "expectedRef",
        "titleMarker",
        "owner",
        "devCommand",
        "suiteCommand",
        "acceptanceCommand",
      ];
      for (const field of requiredFields) {
        if (impl[field] === undefined)
          errors.push(`${impl.key} missing field ${field}`);
      }
    }
  }
}

function validateAnchors(inv: Inventory, anchors: string, errors: string[]) {
  for (const req of inv.requirements) {
    const hid = req.canonicalHeadingId;
    for (const suffix of ["", "-setup", "-steps", "-expected"]) {
      const id = `${hid}${suffix}`;
      if (!anchors.includes(`id="${id}"`)) {
        errors.push(`canonical-anchors.md missing anchor id="${id}"`);
      }
    }
    for (const impl of req.implementations) {
      if (!fragmentExists(anchors, impl.setupRef))
        errors.push(`${impl.key} setupRef not found`);
      if (!fragmentExists(anchors, impl.stepsRef))
        errors.push(`${impl.key} stepsRef not found`);
      if (!fragmentExists(anchors, impl.expectedRef))
        errors.push(`${impl.key} expectedRef not found`);
    }
  }
}

function buildMatrixMd(inv: Inventory): string {
  const lines = [
    `${GEN_HEADER}\n`,
    "# Implementation matrix",
    "",
    "| Key | Priority | Layer | File | Phase | Package | Baseline |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const req of inv.requirements) {
    for (const impl of req.implementations) {
      lines.push(
        `| ${impl.key} | ${req.priority} | ${impl.layer} | \`${impl.file}\` | ${impl.phase} | ${impl.package} | ${impl.baselineStatus} |`,
      );
    }
  }
  return lines.join("\n") + "\n";
}

function buildCountsMd(inv: Inventory): string {
  const reqByPri: Record<string, number> = {};
  const implByPri: Record<string, number> = {};
  let totalImpl = 0;
  for (const req of inv.requirements) {
    reqByPri[req.priority] = (reqByPri[req.priority] ?? 0) + 1;
    implByPri[req.priority] =
      (implByPri[req.priority] ?? 0) + req.implementations.length;
    totalImpl += req.implementations.length;
  }
  return (
    [
      `${GEN_HEADER}\n`,
      "# Inventory counts",
      "",
      "| Priority | Requirements | Implementations |",
      "|---|---:|---:|",
      ...["P0", "P1", "P2"].map(
        (p) => `| ${p} | ${reqByPri[p] ?? 0} | ${implByPri[p] ?? 0} |`,
      ),
      "",
      `| **Total** | **${inv.requirements.length}** | **${totalImpl}** |`,
      "",
    ].join("\n") + "\n"
  );
}

function buildPhaseMd(inv: Inventory, phase: number): string {
  const lines = [
    `${GEN_HEADER}\n`,
    `# Phase ${phase} implementations`,
    "",
    "| Key | Priority | Layer | File | Package |",
    "|---|---|---|---|---|",
  ];
  for (const req of inv.requirements) {
    for (const impl of req.implementations) {
      if (impl.phase === phase) {
        lines.push(
          `| ${impl.key} | ${req.priority} | ${impl.layer} | \`${impl.file}\` | ${impl.package} |`,
        );
      }
    }
  }
  return lines.join("\n") + "\n";
}

function regenerateGeneratedFiles(inv: Inventory) {
  mkdirSync(GEN_DIR, { recursive: true });
  writeFileSync(join(GEN_DIR, "matrix.md"), buildMatrixMd(inv));
  writeFileSync(join(GEN_DIR, "counts.md"), buildCountsMd(inv));
  for (let ph = 2; ph <= 8; ph++) {
    writeFileSync(join(GEN_DIR, `phase-${ph}.md`), buildPhaseMd(inv, ph));
  }
}

function validateGenerated(inv: Inventory, errors: string[]) {
  const expected: Record<string, string> = {
    "matrix.md": buildMatrixMd(inv),
    "counts.md": buildCountsMd(inv),
  };
  for (let ph = 2; ph <= 8; ph++) {
    expected[`phase-${ph}.md`] = buildPhaseMd(inv, ph);
  }
  for (const [file, content] of Object.entries(expected)) {
    const path = join(GEN_DIR, file);
    if (!existsSync(path)) {
      errors.push(`missing generated file: docs/testing/generated/${file}`);
      continue;
    }
    const actual = readFileSync(path, "utf8");
    if (actual !== content) {
      errors.push(`generated file out of date: docs/testing/generated/${file}`);
    }
  }
}

function validateContracts(
  inv: Inventory,
  errors: string[],
  strict: boolean,
  phaseFilter?: number,
) {
  for (const req of inv.requirements) {
    for (const impl of req.implementations) {
      if (!impl.contractRef) continue;
      if (phaseFilter !== undefined && impl.phase !== phaseFilter) continue;
      const path = join(ROOT, impl.contractRef);
      if (!existsSync(path)) {
        errors.push(
          `${impl.key} contractRef missing file: ${impl.contractRef}`,
        );
        continue;
      }
      if (strict) {
        const text = readFileSync(path, "utf8");
        const parsed = JSON.parse(text) as { approved?: boolean };
        if (!parsed.approved)
          errors.push(`${impl.key} contract not approved: ${impl.contractRef}`);
        if (PLACEHOLDER_RE.test(text)) {
          errors.push(
            `${impl.key} contract contains placeholders: ${impl.contractRef}`,
          );
        }
      }
    }
  }
}

function validateDecisions(errors: string[], strict: boolean) {
  if (!existsSync(DECISIONS_PATH)) {
    errors.push("missing docs/testing/product-decisions.json");
    return;
  }
  const doc = JSON.parse(readFileSync(DECISIONS_PATH, "utf8")) as {
    decisions: { id: string; status: string }[];
  };
  const ids = doc.decisions.map((d) => d.id);
  for (let i = 1; i <= 23; i++) {
    const id = `Q${String(i).padStart(2, "0")}`;
    if (!ids.includes(id)) errors.push(`missing product decision ${id}`);
  }
  if (strict) {
    for (const d of doc.decisions) {
      if (d.status !== "approved") errors.push(`decision ${d.id} not approved`);
    }
  }
}

function validatePhase(inv: Inventory, phase: number, errors: string[]) {
  const impls = inv.requirements
    .flatMap((r) => r.implementations)
    .filter((i) => i.phase === phase);
  if (impls.length === 0) errors.push(`no implementations for phase ${phase}`);
  for (const impl of impls) {
    if (impl.implementationStatus !== "complete") {
      errors.push(
        `${impl.key} implementationStatus is ${impl.implementationStatus}, expected complete`,
      );
    }
    if (
      !existsSync(join(ROOT, impl.file)) &&
      !impl.file.startsWith(".github/")
    ) {
      errors.push(`${impl.key} target file missing: ${impl.file}`);
    }
  }
}

function fileMustExist(path: string, errors: string[]) {
  if (!existsSync(join(ROOT, path))) {
    errors.push(`Phase 1 missing required file: ${path}`);
  }
}

function fileMustNotContain(
  path: string,
  needle: string,
  errors: string[],
  label: string,
) {
  const full = join(ROOT, path);
  if (!existsSync(full)) return;
  const text = readFileSync(full, "utf8");
  if (text.includes(needle)) {
    errors.push(`Phase 1 incomplete: ${label} (${path})`);
  }
}

function validatePhase1(errors: string[]) {
  const requiredPaths = [
    "vitest.config.ts",
    "playwright.config.ts",
    "scripts/run-with-local-supabase.ts",
    "scripts/check-migration-drift.ts",
    "scripts/check-generated-types.ts",
    "scripts/scan-artifacts-for-secrets.ts",
    "tests/support/action-context.ts",
    "tests/support/network.ts",
    "tests/support/guards.ts",
    "tests/support/cleanup.ts",
    "tests/support/concurrency.ts",
    "tests/support/run-id.ts",
    "tests/support/factories/user.ts",
    "tests/integration/support/action-context.self.test.ts",
    "tests/unit/harness/network.self.test.ts",
    "supabase/tests/security/relation_security_expectations.sql",
    "supabase/tests/security/relation_security_expectations.inc",
    "supabase/tests/security/service_role_fixture_grants.test.sql",
    "src/lib/supabase/database.types.ts",
  ];
  for (const path of requiredPaths) {
    fileMustExist(path, errors);
  }

  fileMustNotContain(
    "scripts/check-migration-drift.ts",
    "stub (Phase 1)",
    errors,
    "migration drift check is still a stub",
  );
  fileMustNotContain(
    "scripts/check-generated-types.ts",
    "stub (Phase 1)",
    errors,
    "generated types check is still a stub",
  );
  fileMustNotContain(
    "tests/support/network.ts",
    "Skeleton for fetch/http interception",
    errors,
    "network allowlist is still a stub",
  );

  const pkg = JSON.parse(
    readFileSync(join(ROOT, "package.json"), "utf8"),
  ) as { devDependencies?: Record<string, string> };
  if (pkg.devDependencies?.vitest !== "3.2.7") {
    errors.push("Phase 1 requires vitest 3.2.7 pin");
  }
  if (pkg.devDependencies?.["@vitest/coverage-v8"] !== "3.2.7") {
    errors.push("Phase 1 requires @vitest/coverage-v8 3.2.7 pin");
  }
}

function validateRelease(inv: Inventory, errors: string[]) {
  for (const req of inv.requirements) {
    for (const impl of req.implementations) {
      if (
        impl.disposition === "required" &&
        impl.implementationStatus !== "complete"
      ) {
        errors.push(`${impl.key} not complete for release`);
      }
    }
  }
  validateContracts(inv, errors, true);
  validateDecisions(errors, true);
}

function main() {
  const { mode, phase, shouldWriteGenerated } = parseArgs(
    process.argv.slice(2),
  );
  const errors: string[] = [];
  const inv = loadInventory();
  const anchors = readFileSync(ANCHORS_PATH, "utf8");

  validateInventoryStructure(inv, errors);
  validateAnchors(inv, anchors, errors);

  if (shouldWriteGenerated) regenerateGeneratedFiles(inv);

  if (mode === "plan") {
    validateGenerated(inv, errors);
    validateDecisions(errors, false);
    validateContracts(inv, errors, false);
  } else if (mode === "phase") {
    if (phase === null || Number.isNaN(phase)) {
      errors.push("--phase=N is required for mode=phase");
    } else if (phase === 1) {
      validatePhase1(errors);
    } else {
      validatePhase(inv, phase, errors);
      validateContracts(inv, errors, true, phase);
    }
  } else if (mode === "release") {
    validateRelease(inv, errors);
  }

  const implCount = inv.requirements.reduce(
    (n, r) => n + r.implementations.length,
    0,
  );
  console.log(
    `traceability:${mode} — ${inv.requirements.length} requirements, ${implCount} implementations`,
  );

  if (errors.length > 0) {
    console.error("FAIL:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log("PASS");
}

main();
