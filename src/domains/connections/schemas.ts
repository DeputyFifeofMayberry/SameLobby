import { z } from "zod";
import { MAX_REQUEST_MESSAGE_LENGTH } from "@/domains/connections/constants";

const linkPattern = /https?:\/\/|www\./i;

export const connectionRequestMessageSchema = z
  .string()
  .trim()
  .max(
    MAX_REQUEST_MESSAGE_LENGTH,
    `Message must be ${MAX_REQUEST_MESSAGE_LENGTH} characters or fewer.`,
  )
  .refine((value) => value.length === 0 || !linkPattern.test(value), {
    message: "Links are not allowed in connection requests yet.",
  });

export const sendConnectionRequestSchema = z.object({
  recipientAccountId: z.string().uuid("Invalid recipient."),
  message: connectionRequestMessageSchema.optional(),
});
