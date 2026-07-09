import { describe, expect, it } from "vitest";
import {
  approvalThresholdMet,
  canCreateAnotherFreeGroup,
  canCreateAnotherGroup,
} from "@/domains/groups/schemas";

describe("approvalThresholdMet", () => {
  it("requires unanimous approval for groups of four or fewer", () => {
    expect(approvalThresholdMet(3, 2, 2)).toBe(true);
    expect(approvalThresholdMet(4, 3, 4)).toBe(false);
    expect(approvalThresholdMet(4, 4, 4)).toBe(true);
  });

  it("requires majority approval for larger groups", () => {
    expect(approvalThresholdMet(5, 3, 5)).toBe(true);
    expect(approvalThresholdMet(6, 3, 6)).toBe(false);
    expect(approvalThresholdMet(8, 5, 8)).toBe(true);
  });
});

describe("canCreateAnotherGroup", () => {
  it("respects entitlement max", () => {
    expect(canCreateAnotherGroup(0, 1)).toBe(true);
    expect(canCreateAnotherGroup(1, 1)).toBe(false);
    expect(canCreateAnotherGroup(9, 10)).toBe(true);
    expect(canCreateAnotherGroup(10, 10)).toBe(false);
  });
});

describe("canCreateAnotherFreeGroup", () => {
  it("allows first active owned group only", () => {
    expect(canCreateAnotherFreeGroup(0)).toBe(true);
    expect(canCreateAnotherFreeGroup(1)).toBe(false);
  });
});
