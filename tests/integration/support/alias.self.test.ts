import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

describe("vitest alias (integration project)", () => {
  it("resolves @/ imports", () => {
    expect(safeRedirectPath("/onboarding")).toBe("/onboarding");
  });
});
