import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { otherParticipant } from "@/domains/connections/helpers";
import { hasBlockBetween } from "@/domains/connections/queries";
import { canProposePlay } from "@/domains/play/permissions";
import type {
  GamingSessionDetail,
  GamingSessionListItem,
  PlayInvitationDetail,
  PlayInvitationListItem,
  SharedGameOption,
} from "@/domains/play/types";

async function displayNamesForAccounts(
  accountIds: string[],
): Promise<Map<string, string>> {
  if (accountIds.length === 0) return new Map();
  const admin = createAdminClient();
  const { data } = await admin
    .from("gamer_profiles")
    .select("account_id, display_name")
    .in("account_id", accountIds);
  return new Map(
    (data ?? []).map((row) => [
      row.account_id as string,
      (row.display_name as string) ?? "Player",
    ]),
  );
}

async function timeZonesForAccounts(
  accountIds: string[],
): Promise<Map<string, string>> {
  if (accountIds.length === 0) return new Map();
  const admin = createAdminClient();
  const { data } = await admin
    .from("accounts")
    .select("id, time_zone")
    .in("id", accountIds);
  return new Map(
    (data ?? []).map((row) => [
      row.id as string,
      (row.time_zone as string) ?? "America/Los_Angeles",
    ]),
  );
}

export async function getSharedGamesForConversation(
  accountId: string,
  otherAccountId: string,
): Promise<SharedGameOption[]> {
  const admin = createAdminClient();
  const [{ data: viewerGames }, { data: otherGames }] = await Promise.all([
    admin
      .from("user_games")
      .select("game_id, platform_id, game:games(id, name), platform:platforms(id, name)")
      .eq("account_id", accountId)
      .eq("is_active", true),
    admin
      .from("user_games")
      .select("game_id, platform_id")
      .eq("account_id", otherAccountId)
      .eq("is_active", true),
  ]);

  const otherKeys = new Set(
    (otherGames ?? []).map((g) => `${g.game_id}:${g.platform_id}`),
  );

  const options: SharedGameOption[] = [];
  for (const row of viewerGames ?? []) {
    const key = `${row.game_id}:${row.platform_id}`;
    if (!otherKeys.has(key)) continue;
    const game = row.game as unknown as { id: string; name: string } | null;
    const platform = row.platform as unknown as { id: string; name: string } | null;
    options.push({
      gameId: row.game_id as string,
      gameName: game?.name ?? "Game",
      platformId: row.platform_id as string,
      platformName: platform?.name ?? "Platform",
    });
  }
  return options;
}

export async function canProposePlayInConversation(
  accountId: string,
  conversationId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, connection_id, permission")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conversation) return false;

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("account_id")
    .eq("conversation_id", conversationId)
    .eq("account_id", accountId)
    .maybeSingle();

  if (!membership) return false;

  const admin = createAdminClient();
  const { data: connection } = await admin
    .from("connections")
    .select("user_a_id, user_b_id, status")
    .eq("id", conversation.connection_id as string)
    .maybeSingle();

  if (!connection || connection.status !== "connected") return false;

  const otherId = otherParticipant(
    {
      user_a_id: connection.user_a_id as string,
      user_b_id: connection.user_b_id as string,
    },
    accountId,
  );

  const blocked = await hasBlockBetween(accountId, otherId);

  return canProposePlay({
    isConversationMember: true,
    connectionConnected: true,
    permission: conversation.permission as "open",
    isBlocked: blocked,
  });
}

export async function listOpenInvitationsForAccount(
  accountId: string,
): Promise<PlayInvitationListItem[]> {
  const supabase = await createClient();
  const { data: invitations } = await supabase
    .from("play_invitations")
    .select("*")
    .or(
      `proposer_account_id.eq.${accountId},recipient_account_id.eq.${accountId}`,
    )
    .in("status", ["proposed", "accepted"])
    .order("created_at", { ascending: false });

  if (!invitations?.length) return [];

  const gameIds = [...new Set(invitations.map((i) => i.game_id as string))];
  const platformIds = [
    ...new Set(invitations.map((i) => i.platform_id as string)),
  ];
  const otherIds = invitations.map((inv) =>
    inv.proposer_account_id === accountId
      ? (inv.recipient_account_id as string)
      : (inv.proposer_account_id as string),
  );

  const admin = createAdminClient();
  const [{ data: games }, { data: platforms }, names] = await Promise.all([
    admin.from("games").select("id, name").in("id", gameIds),
    admin.from("platforms").select("id, name").in("id", platformIds),
    displayNamesForAccounts(otherIds),
  ]);

  const gameNames = new Map(
    (games ?? []).map((g) => [g.id as string, g.name as string]),
  );
  const platformNames = new Map(
    (platforms ?? []).map((p) => [p.id as string, p.name as string]),
  );

  return invitations.map((inv) => {
    const isIncoming = inv.recipient_account_id === accountId;
    const otherId = isIncoming
      ? (inv.proposer_account_id as string)
      : (inv.recipient_account_id as string);
    return {
      id: inv.id as string,
      direction: isIncoming ? "incoming" : "outgoing",
      status: inv.status as PlayInvitationListItem["status"],
      otherAccountId: otherId,
      otherDisplayName: names.get(otherId) ?? "Player",
      gameName: gameNames.get(inv.game_id as string) ?? "Game",
      platformName: platformNames.get(inv.platform_id as string) ?? "Platform",
      schedulingMode: inv.scheduling_mode as PlayInvitationListItem["schedulingMode"],
      expiresAt: inv.expires_at as string,
      createdAt: inv.created_at as string,
    };
  });
}

export async function getPlayInvitationDetail(
  accountId: string,
  invitationId: string,
): Promise<PlayInvitationDetail | null> {
  const supabase = await createClient();
  const { data: inv } = await supabase
    .from("play_invitations")
    .select("*")
    .eq("id", invitationId)
    .maybeSingle();

  if (!inv) return null;
  if (
    inv.proposer_account_id !== accountId &&
    inv.recipient_account_id !== accountId
  ) {
    return null;
  }

  const { data: timeOptions } = await supabase
    .from("play_time_options")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("sort_order");

  const admin = createAdminClient();
  const [{ data: game }, { data: platform }, { data: session }] =
    await Promise.all([
      admin.from("games").select("name").eq("id", inv.game_id).maybeSingle(),
      admin
        .from("platforms")
        .select("name")
        .eq("id", inv.platform_id)
        .maybeSingle(),
      admin
        .from("gaming_sessions")
        .select("id")
        .eq("invitation_id", invitationId)
        .maybeSingle(),
    ]);

  const names = await displayNamesForAccounts([
    inv.proposer_account_id as string,
    inv.recipient_account_id as string,
  ]);

  return {
    ...(inv as PlayInvitationDetail),
    timeOptions: (timeOptions ?? []) as PlayInvitationDetail["timeOptions"],
    gameName: (game?.name as string) ?? "Game",
    platformName: (platform?.name as string) ?? "Platform",
    proposerDisplayName:
      names.get(inv.proposer_account_id as string) ?? "Player",
    recipientDisplayName:
      names.get(inv.recipient_account_id as string) ?? "Player",
    viewerIsRecipient: inv.recipient_account_id === accountId,
    sessionId: (session?.id as string) ?? null,
  };
}

export async function listUpcomingSessions(
  accountId: string,
): Promise<GamingSessionListItem[]> {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("gaming_sessions")
    .select("*")
    .or(`participant_a_id.eq.${accountId},participant_b_id.eq.${accountId}`)
    .in("status", ["confirmed", "in_progress"])
    .order("confirmed_start_at", { ascending: true });

  if (!sessions?.length) return [];

  const otherIds = sessions.map((s) =>
    s.participant_a_id === accountId
      ? (s.participant_b_id as string)
      : (s.participant_a_id as string),
  );
  const gameIds = [...new Set(sessions.map((s) => s.game_id as string))];
  const platformIds = [...new Set(sessions.map((s) => s.platform_id as string))];
  const allAccountIds = [...new Set([accountId, ...otherIds])];

  const admin = createAdminClient();
  const [{ data: games }, { data: platforms }, names, timeZones] =
    await Promise.all([
      admin.from("games").select("id, name").in("id", gameIds),
      admin.from("platforms").select("id, name").in("id", platformIds),
      displayNamesForAccounts(otherIds),
      timeZonesForAccounts(allAccountIds),
    ]);

  const gameNames = new Map(
    (games ?? []).map((g) => [g.id as string, g.name as string]),
  );
  const platformNames = new Map(
    (platforms ?? []).map((p) => [p.id as string, p.name as string]),
  );

  return sessions.map((s) => {
    const otherId =
      s.participant_a_id === accountId
        ? (s.participant_b_id as string)
        : (s.participant_a_id as string);
    return {
      id: s.id as string,
      otherAccountId: otherId,
      otherDisplayName: names.get(otherId) ?? "Player",
      gameName: gameNames.get(s.game_id as string) ?? "Game",
      platformName: platformNames.get(s.platform_id as string) ?? "Platform",
      status: s.status as GamingSessionListItem["status"],
      confirmedStartAt: s.confirmed_start_at as string,
      sessionLengthMinutes: s.session_length_minutes as number,
      viewerTimeZone: timeZones.get(accountId) ?? "America/Los_Angeles",
      otherTimeZone: timeZones.get(otherId) ?? "America/Los_Angeles",
    };
  });
}

export async function getSessionDetail(
  accountId: string,
  sessionId: string,
): Promise<GamingSessionDetail | null> {
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("gaming_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) return null;
  if (
    session.participant_a_id !== accountId &&
    session.participant_b_id !== accountId
  ) {
    return null;
  }

  const otherId =
    session.participant_a_id === accountId
      ? (session.participant_b_id as string)
      : (session.participant_a_id as string);

  const admin = createAdminClient();
  const [{ data: game }, { data: platform }, { data: feedback }, names, timeZones] =
    await Promise.all([
      admin.from("games").select("name").eq("id", session.game_id).maybeSingle(),
      admin
        .from("platforms")
        .select("name")
        .eq("id", session.platform_id)
        .maybeSingle(),
      supabase
        .from("post_play_feedback")
        .select("id")
        .eq("session_id", sessionId)
        .eq("account_id", accountId)
        .maybeSingle(),
      displayNamesForAccounts([otherId]),
      timeZonesForAccounts([accountId, otherId]),
    ]);

  const viewerIsA = session.participant_a_id === accountId;

  return {
    ...(session as GamingSessionDetail),
    gameName: (game?.name as string) ?? "Game",
    platformName: (platform?.name as string) ?? "Platform",
    otherAccountId: otherId,
    otherDisplayName: names.get(otherId) ?? "Player",
    viewerTimeZone: timeZones.get(accountId) ?? "America/Los_Angeles",
    otherTimeZone: timeZones.get(otherId) ?? "America/Los_Angeles",
    viewerIsParticipantA: viewerIsA,
    viewerOccurred: viewerIsA
      ? (session.occurred_a as boolean | null)
      : (session.occurred_b as boolean | null),
    otherOccurred: viewerIsA
      ? (session.occurred_b as boolean | null)
      : (session.occurred_a as boolean | null),
    feedbackSubmitted: Boolean(feedback),
  };
}
