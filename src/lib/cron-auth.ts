import { NextResponse } from "next/server";

export function authorizeCronRequest(request: Request): NextResponse | null {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Cron not configured" },
        { status: 503 },
      );
    }
    return null;
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
