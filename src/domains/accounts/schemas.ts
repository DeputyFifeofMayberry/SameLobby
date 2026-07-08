import { z } from "zod";

export const attestationSchema = z.object({
  adultConfirmed: z.literal(true, {
    errorMap: () => ({
      message: "You must confirm you are 18 or older to continue.",
    }),
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms." }),
  }),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Privacy Notice." }),
  }),
  communityStandardsAccepted: z.literal(true, {
    errorMap: () => ({
      message: "You must accept the Community Standards.",
    }),
  }),
});

export const deletionRequestSchema = z.object({
  confirm: z.literal(true, {
    errorMap: () => ({
      message: "Confirm account deletion to continue.",
    }),
  }),
});
