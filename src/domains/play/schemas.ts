import { z } from "zod";
import {
  MAX_PLAY_NOTE_LENGTH,
  MAX_TIME_SLOTS,
  SESSION_LENGTH_OPTIONS,
} from "@/domains/play/constants";

const linkPattern = /https?:\/\/|www\./i;

export const playNoteSchema = z
  .string()
  .trim()
  .max(MAX_PLAY_NOTE_LENGTH, `Note must be ${MAX_PLAY_NOTE_LENGTH} characters or fewer.`)
  .refine((value) => value.length === 0 || !linkPattern.test(value), {
    message: "Links are not allowed in play invitations.",
  });

export const proposePlayInvitationSchema = z
  .object({
    conversationId: z.string().uuid("Invalid conversation."),
    recipientAccountId: z.string().uuid("Invalid recipient."),
    gameId: z.string().uuid("Select a game."),
    platformId: z.string().uuid("Select a platform."),
    schedulingMode: z.enum(["play_now", "scheduled"]),
    sessionLengthMinutes: z.coerce
      .number()
      .refine(
        (v): v is (typeof SESSION_LENGTH_OPTIONS)[number] =>
          SESSION_LENGTH_OPTIONS.includes(v as (typeof SESSION_LENGTH_OPTIONS)[number]),
        "Select a session length.",
      ),
    voicePreferred: z.coerce.boolean().optional(),
    note: playNoteSchema.optional(),
    timeSlots: z.array(z.string().min(1)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.schedulingMode === "scheduled") {
      const slots = (data.timeSlots ?? []).filter((s) => s.trim().length > 0);
      if (slots.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Add at least one time option.",
          path: ["timeSlots"],
        });
      }
      if (slots.length > MAX_TIME_SLOTS) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `At most ${MAX_TIME_SLOTS} time options.`,
          path: ["timeSlots"],
        });
      }
    }
  });

export const acceptPlayInvitationSchema = z.object({
  invitationId: z.string().uuid("Invalid invitation."),
  timeOptionId: z.string().uuid("Select a time.").optional(),
});

export const postPlayFeedbackSchema = z.object({
  sessionId: z.string().uuid("Invalid session."),
  continuation: z.enum([
    "keep_chatting",
    "play_again",
    "add_teammate",
    "add_to_group",
    "not_now",
  ]),
});

export function bothParticipantsConfirmedOccurred(
  occurredA: boolean | null,
  occurredB: boolean | null,
): boolean {
  return occurredA === true && occurredB === true;
}

export function shouldShowPostPlayPrompt(
  status: string,
  completedAt: string | null,
): boolean {
  if (status !== "completed") return false;
  if (!completedAt) return true;
  const completed = new Date(completedAt);
  const now = new Date();
  return now.getTime() - completed.getTime() >= 0;
}
