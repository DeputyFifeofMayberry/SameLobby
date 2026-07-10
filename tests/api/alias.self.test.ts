import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

describe("vitest alias (api project)", () => {
  it("resolves @/ imports", () => {
    expect(safeRedirectPath("/messages")).toBe("/messages");
  });
});
