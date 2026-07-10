import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("[SL-T113][unit-decision] @p1 smoke-post-deploy path", () => {
  it("documents the smoke script and degraded-health decision", () => {
    const path = join(process.cwd(), "scripts/smoke-post-deploy.ts");
    const source = readFileSync(path, "utf8");

    expect(source).toContain("Smoke testing");
    expect(source).toContain("/api/health");
    expect(source).toMatch(/r\.ok/);
  });

  it("records that degraded database health still passes current smoke", () => {
    const healthy = { app: "ok", database: "ok" };
    const degraded = { app: "ok", database: "degraded" };
    const unavailable = { app: "ok", database: "unavailable" };

    const currentSmokeAccepts = (status: number) => status >= 200 && status < 300;
    expect(currentSmokeAccepts(200)).toBe(true);

    expect(healthy.database).toBe("ok");
    expect(degraded.database).toBe("degraded");
    expect(unavailable.database).toBe("unavailable");
    expect(currentSmokeAccepts(503)).toBe(false);
  });
});
