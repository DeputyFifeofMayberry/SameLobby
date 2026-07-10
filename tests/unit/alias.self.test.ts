import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

describe("vitest alias (unit project)", () => {
  it("resolves @/ imports", () => {
    expect(safeRedirectPath("/discover")).toBe("/discover");
  });
});
