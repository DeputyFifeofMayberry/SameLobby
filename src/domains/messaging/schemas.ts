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

