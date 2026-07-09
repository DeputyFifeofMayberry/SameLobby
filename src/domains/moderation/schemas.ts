import { z } from "zod";
import {
  MAX_APPEAL_BODY,
  MAX_REPORT_DESCRIPTION,
  MIN_APPEAL_BODY,
  MIN_REPORT_DESCRIPTION,
} from "@/domains/moderation/constants";

export const reportSchema = z.object({
  reportedAccountId: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  playInvitationId: z.string().uuid().optional(),
  includeMessageContext: z.coerce.boolean().optional(),
  category: z.enum([
    "harassment",
    "spam",
    "inappropriate_content",
    "scam",
    "other",
  ]),
  description: z
    .string()
    .trim()
    .min(MIN_REPORT_DESCRIPTION, `Please provide at least ${MIN_REPORT_DESCRIPTION} characters.`)
    .max(MAX_REPORT_DESCRIPTION, "Description is too long."),
});

export const appealSchema = z.object({
  actionId: z.string().uuid(),
  body: z
    .string()
    .trim()
    .min(MIN_APPEAL_BODY)
    .max(MAX_APPEAL_BODY),
});
