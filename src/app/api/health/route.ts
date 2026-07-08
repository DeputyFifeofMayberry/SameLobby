import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const checks: Record<string, string> = {
    app: "ok",
    timestamp: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("feature_flags")
      .select("key")
      .limit(1);
    checks.database = error ? "degraded" : "ok";
  } catch {
    checks.database = "unavailable";
  }

  const status = checks.database === "unavailable" ? 503 : 200;
  return NextResponse.json(checks, { status });
}
