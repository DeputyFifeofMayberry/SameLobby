import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { assertTestGuards } from "../../support/guards";
import { runMessagePurge } from "@/jobs/message-purge";

describe("[SL-T111][integration] @p1 job idempotency", () => {
  it("returns zero deleted rows on a duplicate hourly purge run", async () => {
    assertTestGuards();
    const first = await runMessagePurge();
    const second = await runMessagePurge();

    expect(first.deleted).toBeGreaterThanOrEqual(0);
    expect(second.deleted).toBe(0);
  });
});
