import "server-only";

type SendNewMessageEmailInput = {
  to: string;
  conversationUrl: string;
};

export async function sendNewMessageEmail(
  input: SendNewMessageEmailInput,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const fullUrl = `${siteUrl}${input.conversationUrl}`;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        JSON.stringify({
          type: "email_stub",
          template: "new_message",
          to: input.to,
          url: fullUrl,
        }),
      );
    }
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "SameLobby <onboarding@resend.dev>",
    to: input.to,
    subject: "You have a new message on SameLobby",
    text: `You have a new message from a connection. Open your conversation: ${fullUrl}`,
  });
}

type SendPlayInvitationEmailInput = {
  to: string;
  invitationUrl: string;
};

export async function sendPlayInvitationEmail(
  input: SendPlayInvitationEmailInput,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const fullUrl = `${siteUrl}${input.invitationUrl}`;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        JSON.stringify({
          type: "email_stub",
          template: "play_invitation",
          to: input.to,
          url: fullUrl,
        }),
      );
    }
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "SameLobby <onboarding@resend.dev>",
    to: input.to,
    subject: "You have a play invitation on SameLobby",
    text: `A connection invited you to play. View the invitation: ${fullUrl}`,
  });
}

type SendPlayReminderEmailInput = {
  to: string;
  sessionUrl: string;
  windowLabel: string;
};

export async function sendPlayReminderEmail(
  input: SendPlayReminderEmailInput,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const fullUrl = `${siteUrl}${input.sessionUrl}`;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        JSON.stringify({
          type: "email_stub",
          template: "play_reminder",
          to: input.to,
          url: fullUrl,
          window: input.windowLabel,
        }),
      );
    }
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "SameLobby <onboarding@resend.dev>",
    to: input.to,
    subject: "SameLobby play session reminder",
    text: `Your play session starts in ${input.windowLabel}. View details: ${fullUrl}`,
  });
}
