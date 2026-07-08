import { describe, expect, it } from "vitest";
import { attestationSchema, signInSchema } from "@/domains/accounts/schemas";

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
});

describe("signInSchema", () => {
  it("accepts valid email", () => {
    const result = signInSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signInSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});
