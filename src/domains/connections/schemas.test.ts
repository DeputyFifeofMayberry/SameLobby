import { describe, expect, it } from "vitest";
import { connectionRequestLimitError } from "@/domains/connections/helpers";
import {
  MAX_PENDING_OUTGOING_REQUESTS,
  MAX_REQUESTS_PER_DAY,
} from "@/domains/connections/constants";
import { connectionRequestMessageSchema } from "@/domains/connections/schemas";

describe("connectionRequestLimitError", () => {
  it("blocks when pending outgoing cap reached", () => {
    expect(
      connectionRequestLimitError({
        pendingOutgoingCount: MAX_PENDING_OUTGOING_REQUESTS,
        requestsSentLast24Hours: 0,
      }),
    ).toContain("pending outgoing");
  });

  it("blocks when daily cap reached", () => {
    expect(
      connectionRequestLimitError({
        pendingOutgoingCount: 0,
        requestsSentLast24Hours: MAX_REQUESTS_PER_DAY,
      }),
    ).toContain("per day");
  });

  it("allows under limits", () => {
    expect(
      connectionRequestLimitError({
        pendingOutgoingCount: 0,
        requestsSentLast24Hours: 0,
      }),
    ).toBeNull();
  });
});

describe("connectionRequestMessageSchema", () => {
  it("rejects links in request notes", () => {
    const result = connectionRequestMessageSchema.safeParse("check https://evil.com");
    expect(result.success).toBe(false);
  });

  it("accepts short plain text", () => {
    const result = connectionRequestMessageSchema.safeParse("Fortnite evenings PST");
    expect(result.success).toBe(true);
  });
});
