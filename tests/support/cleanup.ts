type CleanupFn = () => Promise<void> | void;

const registry = new Map<string, CleanupFn[]>();

export function registerCleanup(runId: string, fn: CleanupFn): void {
  const list = registry.get(runId) ?? [];
  list.push(fn);
  registry.set(runId, list);
}

export async function runCleanup(runId: string): Promise<void> {
  const fns = registry.get(runId) ?? [];
  for (const fn of [...fns].reverse()) {
    await fn();
  }
  registry.delete(runId);
}

export function clearCleanupRegistry(): void {
  registry.clear();
}
