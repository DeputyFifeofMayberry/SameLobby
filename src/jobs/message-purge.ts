import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function runMessagePurge(): Promise<{ deleted: number }> {
  const admin = createAdminClient();
  const idempotencyKey = new Date().toISOString().slice(0, 13);

  const { data: existing } = await admin
    .from("job_runs")
    .select("id")
    .eq("job_name", "message_purge")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existing) return { deleted: 0 };

  await admin.from("job_runs").insert({
    job_name: "message_purge",
    idempotency_key: idempotencyKey,
    status: "running",
  });

  const { data: deleted, error } = await admin.rpc("purge_expired_messages", {
    p_batch_size: 500,
  });

  if (error) {
    await admin
      .from("job_runs")
      .update({ status: "failed", completed_at: new Date().toISOString() })
      .eq("job_name", "message_purge")
      .eq("idempotency_key", idempotencyKey);
    throw error;
  }

  await admin
    .from("job_runs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      metadata: { deleted: deleted ?? 0 },
    })
    .eq("job_name", "message_purge")
    .eq("idempotency_key", idempotencyKey);

  return { deleted: (deleted as number) ?? 0 };
}
