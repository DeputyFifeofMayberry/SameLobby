import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function runDeletionPipeline(): Promise<{ processed: number }> {
  const admin = createAdminClient();
  const idempotencyKey = new Date().toISOString().slice(0, 13);

  const { data: existing } = await admin
    .from("job_runs")
    .select("id")
    .eq("job_name", "deletion_pipeline")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existing) return { processed: 0 };

  await admin.from("job_runs").insert({
    job_name: "deletion_pipeline",
    idempotency_key: idempotencyKey,
    status: "running",
  });

  const { data: processed, error } = await admin.rpc("process_deletion_stage", {
    p_batch_size: 10,
  });

  if (error) {
    await admin
      .from("job_runs")
      .update({ status: "failed", completed_at: new Date().toISOString() })
      .eq("job_name", "deletion_pipeline")
      .eq("idempotency_key", idempotencyKey);
    throw error;
  }

  await admin
    .from("job_runs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      metadata: { processed: processed ?? 0 },
    })
    .eq("job_name", "deletion_pipeline")
    .eq("idempotency_key", idempotencyKey);

  return { processed: (processed as number) ?? 0 };
}
