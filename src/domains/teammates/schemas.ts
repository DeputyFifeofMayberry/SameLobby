import { z } from "zod";
import { MAX_TEAMMATE_NOTE_LENGTH } from "@/domains/teammates/constants";

export const teammateNoteSchema = z
  .string()
  .trim()
  .min(1, "Note cannot be empty.")
  .max(MAX_TEAMMATE_NOTE_LENGTH, `Note must be ${MAX_TEAMMATE_NOTE_LENGTH} characters or fewer.`);

export const proposeTeammateSchema = z.object({
  otherAccountId: z.string().uuid("Invalid player."),
});

export const saveTeammateNoteSchema = z.object({
  relationshipId: z.string().uuid("Invalid relationship."),
  body: teammateNoteSchema,
});

export function mutualTeammateMatch(
  userAAffirmed: boolean,
  userBAffirmed: boolean,
): boolean {
  return userAAffirmed && userBAffirmed;
}

export function isActiveTeammateStatus(status: string): boolean {
  return status === "teammate" || status === "regular_teammate";
}
