import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

describe("safeRedirectPath", () => {
  it("returns fallback for null or empty", () => {
    expect(safeRedirectPath(null)).toBe("/discover");
    expect(safeRedirectPath(undefined)).toBe("/discover");
    expect(safeRedirectPath("")).toBe("/discover");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/discover");
    expect(safeRedirectPath("https://evil.com")).toBe("/discover");
  });

  it("allows allowlisted app paths", () => {
    expect(safeRedirectPath("/discover")).toBe("/discover");
    expect(safeRedirectPath("/onboarding/attestation")).toBe(
      "/onboarding/attestation",
    );
    expect(safeRedirectPath("/settings/account")).toBe("/settings/account");
  });

  it("rejects paths outside allowlist", () => {
    expect(safeRedirectPath("/sign-in")).toBe("/discover");
    expect(safeRedirectPath("/admin")).toBe("/discover");
  });
});
