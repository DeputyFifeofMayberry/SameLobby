import { z } from "zod";

export const savedSearchFiltersSchema = z.object({
  q: z.string().optional(),
  gameId: z.string().uuid().optional(),
  platformId: z.string().uuid().optional(),
  goal: z.string().optional(),
});

export const savedSearchNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required.")
  .max(80, "Name is too long.");

export const checkoutPlanSchema = z.enum(["plus_monthly", "plus_annual"]);

export const savedSearchSchema = z.object({
  name: savedSearchNameSchema,
  filters: savedSearchFiltersSchema,
});

export const billingReauthSchema = z.object({
  password: z.string().min(1, "Password is required."),
  planKey: checkoutPlanSchema.optional(),
});
