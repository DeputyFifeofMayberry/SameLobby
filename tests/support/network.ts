const DEFAULT_ALLOWED_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

export type NetworkAllowlist = {
  allowedHosts: Set<string>;
};

export function createNetworkAllowlist(
  hosts: Iterable<string> = DEFAULT_ALLOWED_HOSTS,
): NetworkAllowlist {
  return { allowedHosts: new Set(hosts) };
}

export function assertHostAllowed(allowlist: NetworkAllowlist, url: string): void {
  const host = new URL(url).hostname;
  if (!allowlist.allowedHosts.has(host)) {
    throw new Error(`Network call blocked by allowlist: ${host}`);
  }
}

type FetchFn = typeof fetch;

let installedAllowlist: NetworkAllowlist | null = null;
let originalFetch: FetchFn | null = null;

/**
 * Intercepts global fetch for api/integration suites. Restores on uninstall.
 */
export function installNetworkAllowlist(allowlist: NetworkAllowlist): () => void {
  if (typeof globalThis.fetch !== "function") {
    return () => {};
  }
  if (originalFetch) {
    throw new Error("Network allowlist is already installed");
  }

  originalFetch = globalThis.fetch.bind(globalThis);
  installedAllowlist = allowlist;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    assertHostAllowed(installedAllowlist!, url);
    return originalFetch!(input, init);
  }) as FetchFn;

  return () => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    }
    originalFetch = null;
    installedAllowlist = null;
  };
}

export function isNetworkAllowlistInstalled(): boolean {
  return originalFetch !== null;
}
