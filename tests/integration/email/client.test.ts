import { vi } from "vitest";

vi.mock("server-only", () => ({}));

const sendMock = vi.fn().mockResolvedValue({ data: { id: "email-1" }, error: null });

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sendNewMessageEmail } from "@/lib/email/client";

describe("[SL-T060][integration] @p1 email client", () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.RESEND_FROM_EMAIL;

  beforeEach(() => {
    sendMock.mockClear();
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "SameLobby <test@resend.dev>";
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  });

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalApiKey;
    }
    if (originalFrom === undefined) {
      delete process.env.RESEND_FROM_EMAIL;
    } else {
      process.env.RESEND_FROM_EMAIL = originalFrom;
    }
  });

  it("sends a new-message email through the Resend client when configured", async () => {
    await sendNewMessageEmail({
      to: "user@test.local",
      conversationUrl: "/messages/conv-123",
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.local",
        subject: "You have a new message on SameLobby",
      }),
    );
  });
});
