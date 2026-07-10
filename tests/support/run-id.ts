import { randomUUID } from "node:crypto";

export function createTestRunId(prefix = "run"): string {
  return `${prefix}-${randomUUID()}`;
}

export function createNamespacedId(
  parts: Array<string | number | undefined>,
): string {
  return parts.filter(Boolean).join(":");
}
