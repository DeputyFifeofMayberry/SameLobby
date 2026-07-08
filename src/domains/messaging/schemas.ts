import { z } from "zod";
import { MAX_MESSAGE_LENGTH } from "@/domains/messaging/constants";

export const linkPattern = /https?:\/\/|www\./i;

export function containsLink(text: string): boolean {
  return linkPattern.test(text);
}

export const messageBodySchema = z
  .string()
  .trim()
  .min(1, "Message cannot be empty.")
  .max(MAX_MESSAGE_LENGTH, `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation."),
  body: messageBodySchema,
  allowLinks: z.boolean().optional(),
});

export const reportSchema = z.object({
  reportedAccountId: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
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
    .min(10, "Please provide at least 10 characters.")
    .max(2000, "Description is too long."),
});
