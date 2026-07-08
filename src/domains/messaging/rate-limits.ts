import {
  MESSAGE_RATE_LIMIT_COUNT,
  MESSAGE_RATE_LIMIT_WINDOW_MINUTES,
} from "@/domains/messaging/constants";

export type MessageRateLimitInput = {
  messagesSentInWindow: number;
};

export function messageRateLimitError(
  input: MessageRateLimitInput,
): string | null {
  if (input.messagesSentInWindow >= MESSAGE_RATE_LIMIT_COUNT) {
    return "You're sending messages too quickly. Try again in a moment.";
  }
  return null;
}

export function rateLimitWindowStart(): Date {
  const since = new Date();
  since.setMinutes(since.getMinutes() - MESSAGE_RATE_LIMIT_WINDOW_MINUTES);
  return since;
}
