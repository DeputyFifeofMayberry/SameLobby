import { describe, expect, it } from "vitest";
import {
  bothParticipantsConfirmedOccurred,
  proposePlayInvitationSchema,
  shouldShowPostPlayPrompt,
} from "@/domains/play/schemas";

describe("proposePlayInvitationSchema", () => {
  const base = {
    conversationId: "a1111111-1111-1111-1111-111111111111",
    recipientAccountId: "a2222222-2222-2222-2222-222222222222",
    gameId: "b1111111-1111-1111-1111-111111111111",
    platformId: "b2222222-2222-2222-2222-222222222222",
    sessionLengthMinutes: 60,
  };

  it("accepts play_now without time slots", () => {
    const result = proposePlayInvitationSchema.safeParse({
      ...base,
      schedulingMode: "play_now",
    });
    expect(result.success).toBe(true);
  });

  it("requires time slots for scheduled mode", () => {
    const result = proposePlayInvitationSchema.safeParse({
      ...base,
      schedulingMode: "scheduled",
      timeSlots: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects links in note", () => {
    const result = proposePlayInvitationSchema.safeParse({
      ...base,
      schedulingMode: "play_now",
      note: "check https://example.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("bothParticipantsConfirmedOccurred", () => {
  it("requires both true", () => {
    expect(bothParticipantsConfirmedOccurred(true, true)).toBe(true);
    expect(bothParticipantsConfirmedOccurred(true, null)).toBe(false);
    expect(bothParticipantsConfirmedOccurred(false, true)).toBe(false);
  });
});

describe("shouldShowPostPlayPrompt", () => {
  it("shows only for completed sessions", () => {
    expect(shouldShowPostPlayPrompt("completed", null)).toBe(true);
    expect(shouldShowPostPlayPrompt("confirmed", null)).toBe(false);
  });
});
