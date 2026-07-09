import { NextResponse } from "next/server";
import { getAccountForUser, getSessionUser } from "@/domains/accounts/queries";
import { getSessionDetail } from "@/domains/play/queries";
import { generateIcsEvent } from "@/domains/play/timezone";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id: sessionId } = await context.params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await getAccountForUser(user.id);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await getSessionDetail(account.id, sessionId);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const endIso = new Date(
    new Date(session.confirmed_start_at).getTime() +
      session.session_length_minutes * 60_000,
  ).toISOString();

  const ics = generateIcsEvent({
    uid: `samelobby-play-${session.id}@samelobby.com`,
    summary: `SameLobby play — ${session.gameName}`,
    startIso: session.confirmed_start_at,
    endIso,
  });

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="samelobby-play.ics"',
    },
  });
}
