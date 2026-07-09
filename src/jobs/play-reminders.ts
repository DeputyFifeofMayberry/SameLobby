import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPlayReminderNotification } from "@/domains/notifications/service";

type ReminderWindow = "24h" | "30m";

const WINDOWS: Record<
  ReminderWindow,
  { label: string; minMs: number; maxMs: number; column: "reminder_24h_sent_at" | "reminder_30m_sent_at" }
> = {
  "24h": {
    label: "24 hours",
    minMs: 23 * 60 * 60 * 1000,
    maxMs: 25 * 60 * 60 * 1000,
    column: "reminder_24h_sent_at",
  },
  "30m": {
    label: "30 minutes",
    minMs: 25 * 60 * 1000,
    maxMs: 35 * 60 * 1000,
    column: "reminder_30m_sent_at",
  },
};

async function displayName(accountId: string): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("gamer_profiles")
    .select("display_name")
    .eq("account_id", accountId)
    .maybeSingle();
  return (data?.display_name as string) ?? "your connection";
}

export async function runPlayReminders(): Promise<{ sent: number }> {
  const admin = createAdminClient();
  const now = Date.now();
  let sent = 0;

  const { data: sessions } = await admin
    .from("gaming_sessions")
    .select(
      "id, confirmed_start_at, participant_a_id, participant_b_id, reminder_24h_sent_at, reminder_30m_sent_at",
    )
    .in("status", ["confirmed", "in_progress"]);

  for (const session of sessions ?? []) {
    const startMs = new Date(session.confirmed_start_at as string).getTime();
    const delta = startMs - now;

    for (const window of Object.keys(WINDOWS) as ReminderWindow[]) {
      const config = WINDOWS[window];
      if (delta < config.minMs || delta > config.maxMs) continue;
      if (session[config.column]) continue;

      const participants = [
        session.participant_a_id as string,
        session.participant_b_id as string,
      ];

      for (const accountId of participants) {
        const otherId = participants.find((id) => id !== accountId)!;
        await createPlayReminderNotification({
          recipientAccountId: accountId,
          otherDisplayName: await displayName(otherId),
          sessionId: session.id as string,
          windowLabel: config.label,
        });
      }

      await admin
        .from("gaming_sessions")
        .update({ [config.column]: new Date().toISOString() })
        .eq("id", session.id);

      sent += 1;
    }
  }

  return { sent };
}
