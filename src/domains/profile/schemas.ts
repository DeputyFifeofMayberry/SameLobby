import { z } from "zod";
import {
  COMMUNICATION_MODES,
  INTENT_GOALS,
  VISIBILITY_LEVELS,
} from "@/domains/profile/types";

const displayNameRegex = /^[a-zA-Z0-9_][a-zA-Z0-9_-]{2,23}$/;

export const displayNameSchema = z
  .string()
  .trim()
  .min(3, "Display name must be at least 3 characters.")
  .max(24, "Display name must be at most 24 characters.")
  .regex(
    displayNameRegex,
    "Use 3–24 characters: letters, numbers, underscores, hyphens.",
  );

export const identityStepSchema = z.object({
  displayName: displayNameSchema,
  timeZone: z.string().min(1, "Select a time zone."),
});

export const communicationStepSchema = z.object({
  modes: z
    .array(z.enum(COMMUNICATION_MODES))
    .min(1, "Choose at least one communication mode."),
});

export const goalStepSchema = z.object({
  goal: z.enum(INTENT_GOALS),
});

export const introductionSchema = z
  .string()
  .trim()
  .max(500, "Introduction must be at most 500 characters.")
  .optional()
  .or(z.literal(""));

export const visibilitySchema = z.enum(VISIBILITY_LEVELS);

export const availabilityWindowSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const MAX_ACTIVE_USER_GAMES = 8;
