const DEFAULT_ALLOWED_HOSTS = new Set(["127.0.0.1", "localhost"]);

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

/**
 * Skeleton for fetch/http interception — full Undici/WebSocket wiring in later phases.
 */
export function installNetworkAllowlist(_allowlist: NetworkAllowlist): () => void {
  return () => {};
}
