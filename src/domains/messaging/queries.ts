import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { otherParticipant } from "@/domains/connections/helpers";
import type {
  Conversation,
  ConversationListItem,
  ConversationThread,
  Message,
} from "@/domains/messaging/types";
import { INTENT_GOAL_LABELS, type IntentGoal } from "@/domains/profile/types";

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

async function sharedGameLabel(
  accountA: string,
  accountB: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data: gamesA } = await admin
    .from("user_games")
    .select("game_id, game:games(name)")
    .eq("account_id", accountA)
    .eq("is_active", true);
  const { data: gamesB } = await admin
    .from("user_games")
    .select("game_id")
    .eq("account_id", accountB)
    .eq("is_active", true);

  const bGameIds = new Set((gamesB ?? []).map((g) => g.game_id as string));
  for (const row of gamesA ?? []) {
    if (bGameIds.has(row.game_id as string)) {
      const game = row.game as unknown as { name: string } | null;
      return game?.name ?? null;
    }
  }
  return null;
}

export async function getConversationIdForConnection(
  connectionId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("connection_id", connectionId)
    .maybeSingle();
  return (data?.id as string) ?? null;
}

export async function listConversationsForAccount(
  accountId: string,
): Promise<ConversationListItem[]> {
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("account_id", accountId);

  if (!memberships?.length) return [];

  const conversationIds = memberships.map((m) => m.conversation_id as string);
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, connection_id, permission, updated_at")
    .in("id", conversationIds)
    .neq("permission", "blocked");

  if (!conversations?.length) return [];

  const admin = createAdminClient();
  const { data: connections } = await admin
    .from("connections")
    .select("id, user_a_id, user_b_id")
    .in(
      "id",
      conversations.map((c) => c.connection_id as string),
    );

  const connectionById = new Map(
    (connections ?? []).map((c) => [c.id as string, c]),
  );

  const otherIds = conversations.map((conv) => {
    const conn = connectionById.get(conv.connection_id as string);
    if (!conn) return accountId;
    return otherParticipant(
      { user_a_id: conn.user_a_id as string, user_b_id: conn.user_b_id as string },
      accountId,
    );
  });

  const names = await displayNamesForAccounts(otherIds);

  const items: ConversationListItem[] = [];
  for (let i = 0; i < conversations.length; i++) {
    const conv = conversations[i]!;
    const membership = memberships.find(
      (m) => m.conversation_id === conv.id,
    );
    const otherId = otherIds[i]!;

    const { data: lastMessage } = await supabase
      .from("messages")
      .select("body, created_at, sender_account_id")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastRead = membership?.last_read_at as string | null;
    const unread =
      lastMessage != null &&
      (!lastRead ||
        new Date(lastMessage.created_at as string) > new Date(lastRead)) &&
      (lastMessage.sender_account_id as string) !== accountId;

    const gameLabel = await sharedGameLabel(accountId, otherId);

    items.push({
      conversationId: conv.id as string,
      otherAccountId: otherId,
      otherDisplayName: names.get(otherId) ?? "Player",
      sharedGameLabel: gameLabel,
      lastMessagePreview: lastMessage
        ? ((lastMessage.body as string).slice(0, 80) || null)
        : null,
      lastMessageAt: (lastMessage?.created_at as string) ?? null,
      unread,
    });
  }

  items.sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });

  return items;
}

export async function getConversationThread(
  accountId: string,
  conversationId: string,
): Promise<ConversationThread | null> {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("account_id", accountId)
    .maybeSingle();

  if (!membership) return null;

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .neq("permission", "blocked")
    .maybeSingle();

  if (!conversation) return null;

  const admin = createAdminClient();
  const { data: connection } = await admin
    .from("connections")
    .select("user_a_id, user_b_id, connection_request_id")
    .eq("id", conversation.connection_id as string)
    .maybeSingle();

  if (!connection) return null;

  const otherAccountId = otherParticipant(
    {
      user_a_id: connection.user_a_id as string,
      user_b_id: connection.user_b_id as string,
    },
    accountId,
  );

  const names = await displayNamesForAccounts([otherAccountId]);
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  const [{ data: viewerGames }, { data: otherGames }] = await Promise.all([
    admin
      .from("user_games")
      .select("game_id, platform_id, game:games(name), platform:platforms(name)")
      .eq("account_id", accountId)
      .eq("is_active", true),
    admin
      .from("user_games")
      .select("game_id, platform_id, game:games(name), platform:platforms(name)")
      .eq("account_id", otherAccountId)
      .eq("is_active", true),
  ]);

  const otherGameIds = new Set((otherGames ?? []).map((g) => g.game_id as string));
  const sharedGameLabels: string[] = [];
  for (const row of viewerGames ?? []) {
    if (otherGameIds.has(row.game_id as string)) {
      const game = row.game as unknown as { name: string } | null;
      const platform = row.platform as unknown as { name: string } | null;
      sharedGameLabels.push(
        `${game?.name ?? "Game"} · ${platform?.name ?? "Platform"}`,
      );
    }
  }

  let goalLabel: string | null = null;
  let goal: IntentGoal | null = null;
  const { data: intent } = await admin
    .from("current_intents")
    .select("goal")
    .eq("account_id", otherAccountId)
    .eq("status", "active")
    .maybeSingle();
  if (intent?.goal) {
    goal = intent.goal as IntentGoal;
    goalLabel = INTENT_GOAL_LABELS[goal];
  }

  return {
    conversation: conversation as Conversation,
    otherAccountId,
    otherDisplayName: names.get(otherAccountId) ?? "Player",
    sharedGameLabels,
    goalLabel,
    goal,
    messages: (messages ?? []) as Message[],
    viewerAccountId: accountId,
  };
}

export async function markConversationRead(
  accountId: string,
  conversationId: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("account_id", accountId);
}

export async function getConversationIdsForConnections(
  connectionIds: string[],
): Promise<Map<string, string>> {
  if (connectionIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id, connection_id")
    .in("connection_id", connectionIds);

  return new Map(
    (data ?? []).map((row) => [row.connection_id as string, row.id as string]),
  );
}

export async function countRecentMessages(accountId: string): Promise<number> {
  const supabase = await createClient();
  const since = new Date();
  since.setMinutes(since.getMinutes() - 5);
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_account_id", accountId)
    .gte("created_at", since.toISOString());
  return count ?? 0;
}
