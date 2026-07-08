import { describe, expect, it } from "vitest";
import {
  attestationSchema,
  deletionRequestSchema,
} from "@/domains/accounts/schemas";

describe("attestationSchema", () => {
  it("accepts valid attestation", () => {
    const result = attestationSchema.safeParse({
      adultConfirmed: true,
      termsAccepted: true,
      privacyAccepted: true,
      communityStandardsAccepted: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing adult confirmation", () => {
    const result = attestationSchema.safeParse({
      adultConfirmed: false,
      termsAccepted: true,
      privacyAccepted: true,
      communityStandardsAccepted: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing terms acceptance", () => {
    const result = attestationSchema.safeParse({
      adultConfirmed: true,
      termsAccepted: false,
      privacyAccepted: true,
      communityStandardsAccepted: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("deletionRequestSchema", () => {
  it("accepts confirmed deletion", () => {
    const result = deletionRequestSchema.safeParse({ confirm: true });
    expect(result.success).toBe(true);
  });

  it("rejects unconfirmed deletion", () => {
    const result = deletionRequestSchema.safeParse({ confirm: false });
    expect(result.success).toBe(false);
  });
});
