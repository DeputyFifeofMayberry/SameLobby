import { describe, expect, it } from "vitest";
import {
  mutualTeammateMatch,
  proposeTeammateSchema,
  saveTeammateNoteSchema,
  teammateNoteSchema,
} from "@/domains/teammates/schemas";

describe("mutualTeammateMatch", () => {
  it("returns true only when both users affirmed", () => {
    expect(mutualTeammateMatch(true, true)).toBe(true);
    expect(mutualTeammateMatch(true, false)).toBe(false);
    expect(mutualTeammateMatch(false, true)).toBe(false);
    expect(mutualTeammateMatch(false, false)).toBe(false);
  });
});

describe("teammateNoteSchema", () => {
  it("rejects empty notes", () => {
    expect(teammateNoteSchema.safeParse("   ").success).toBe(false);
  });

  it("accepts trimmed notes within limit", () => {
    expect(teammateNoteSchema.safeParse("Plays support on weekends").success).toBe(
      true,
    );
  });
});

describe("proposeTeammateSchema", () => {
  it("requires a valid uuid", () => {
    expect(
      proposeTeammateSchema.safeParse({ otherAccountId: "not-a-uuid" }).success,
    ).toBe(false);
    expect(
      proposeTeammateSchema.safeParse({
        otherAccountId: "a1111111-1111-1111-1111-111111111111",
      }).success,
    ).toBe(true);
  });
});

describe("saveTeammateNoteSchema", () => {
  it("requires relationship id and body", () => {
    const result = saveTeammateNoteSchema.safeParse({
      relationshipId: "a1111111-1111-1111-1111-111111111111",
      body: "Evening duo",
    });
    expect(result.success).toBe(true);
  });
});
