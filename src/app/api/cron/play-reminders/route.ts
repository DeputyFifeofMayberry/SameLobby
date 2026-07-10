import { NextResponse } from "next/server";
import { runPlayReminders } from "@/jobs/play-reminders";
import { authorizeCronRequest } from "@/lib/cron-auth";

export async function GET(request: Request) {
  const denied = authorizeCronRequest(request);
  if (denied) return denied;

  try {
    const result = await runPlayReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
