import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

describe("vitest alias (component project)", () => {
  it("resolves @/ imports", () => {
    expect(safeRedirectPath("/settings")).toBe("/settings");
  });
});
