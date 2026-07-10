import { describe, expect, it } from "vitest";
import {
  assertHostAllowed,
  createNetworkAllowlist,
  installNetworkAllowlist,
  isNetworkAllowlistInstalled,
} from "../../support/network";

describe("network allowlist harness", () => {
  it("blocks hosts outside the allowlist", () => {
    const allowlist = createNetworkAllowlist(["127.0.0.1"]);
    expect(() => assertHostAllowed(allowlist, "https://example.com")).toThrow(
      /blocked by allowlist/,
    );
    expect(() =>
      assertHostAllowed(allowlist, "http://127.0.0.1:54321/rest/v1/"),
    ).not.toThrow();
  });

  it("installs and restores global fetch interception", async () => {
    expect(isNetworkAllowlistInstalled()).toBe(false);
    const uninstall = installNetworkAllowlist(createNetworkAllowlist(["127.0.0.1"]));

    await expect(fetch("https://example.com")).rejects.toThrow(
      /blocked by allowlist/,
    );

    uninstall();
    expect(isNetworkAllowlistInstalled()).toBe(false);
  });
});
