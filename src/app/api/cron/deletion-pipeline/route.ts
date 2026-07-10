import { NextResponse } from "next/server";
import { runDeletionPipeline } from "@/jobs/deletion-pipeline";
import { authorizeCronRequest } from "@/lib/cron-auth";

export async function GET(request: Request) {
  const denied = authorizeCronRequest(request);
  if (denied) return denied;

  try {
    const result = await runDeletionPipeline();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
