import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { orderedPair, otherParticipant } from "@/domains/connections/helpers";
import type {
  Connection,
  ConnectionRequest,
  ConnectionRequestView,
  ConnectionView,
  RequestRelationshipState,
} from "@/domains/connections/types";

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

function toRequestView(
  request: ConnectionRequest,
  viewerAccountId: string,
  names: Map<string, string>,
): ConnectionRequestView {
  const incoming = request.recipient_account_id === viewerAccountId;
  const otherAccountId = incoming
    ? request.sender_account_id
    : request.recipient_account_id;

  return {
    ...request,
    otherAccountId,
    otherDisplayName: names.get(otherAccountId) ?? "Player",
    direction: incoming ? "incoming" : "outgoing",
  };
}

export async function getIncomingRequests(
  accountId: string,
): Promise<ConnectionRequestView[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("connection_requests")
    .select("*")
    .eq("recipient_account_id", accountId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as ConnectionRequest[];
  const names = await displayNamesForAccounts(
    requests.map((r) => r.sender_account_id),
  );

  return requests.map((r) => toRequestView(r, accountId, names));
}

export async function getOutgoingRequests(
  accountId: string,
): Promise<ConnectionRequestView[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("connection_requests")
    .select("*")
    .eq("sender_account_id", accountId)
    .in("status", ["pending", "declined", "expired", "cancelled"])
    .order("created_at", { ascending: false })
    .limit(20);

  const requests = (data ?? []) as ConnectionRequest[];
  const names = await displayNamesForAccounts(
    requests.map((r) => r.recipient_account_id),
  );

  return requests.map((r) => toRequestView(r, accountId, names));
}

export async function getActiveConnections(
  accountId: string,
): Promise<ConnectionView[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("connections")
    .select("*")
    .or(`user_a_id.eq.${accountId},user_b_id.eq.${accountId}`)
    .eq("status", "connected")
    .order("created_at", { ascending: false });

  const connections = (data ?? []) as Connection[];
  const otherIds = connections.map((c) => otherParticipant(c, accountId));
  const names = await displayNamesForAccounts(otherIds);

  return connections.map((connection) => ({
    ...connection,
    otherAccountId: otherParticipant(connection, accountId),
    otherDisplayName:
      names.get(otherParticipant(connection, accountId)) ?? "Player",
  }));
}

export async function getRequestLimitCounts(accountId: string) {
  const supabase = await createClient();
  const since = new Date();
  since.setHours(since.getHours() - 24);

  const [{ count: pendingOutgoing }, { count: sentLast24Hours }] =
    await Promise.all([
      supabase
        .from("connection_requests")
        .select("id", { count: "exact", head: true })
        .eq("sender_account_id", accountId)
        .eq("status", "pending"),
      supabase
        .from("connection_requests")
        .select("id", { count: "exact", head: true })
        .eq("sender_account_id", accountId)
        .gte("created_at", since.toISOString()),
    ]);

  return {
    pendingOutgoingCount: pendingOutgoing ?? 0,
    requestsSentLast24Hours: sentLast24Hours ?? 0,
  };
}

export async function getRelationshipState(
  viewerAccountId: string,
  targetAccountId: string,
): Promise<RequestRelationshipState> {
  const supabase = await createClient();

  const pair = orderedPair(viewerAccountId, targetAccountId);

  const [{ data: block }, { data: connection }, { data: pending }] =
    await Promise.all([
      supabase
        .from("blocks")
        .select("id")
        .or(
          `and(blocker_account_id.eq.${viewerAccountId},blocked_account_id.eq.${targetAccountId}),and(blocker_account_id.eq.${targetAccountId},blocked_account_id.eq.${viewerAccountId})`,
        )
        .limit(1)
        .maybeSingle(),
      supabase
        .from("connections")
        .select("id")
        .eq("user_a_id", pair.userA)
        .eq("user_b_id", pair.userB)
        .eq("status", "connected")
        .maybeSingle(),
      supabase
        .from("connection_requests")
        .select("sender_account_id, recipient_account_id, status")
        .or(
          `and(sender_account_id.eq.${viewerAccountId},recipient_account_id.eq.${targetAccountId}),and(sender_account_id.eq.${targetAccountId},recipient_account_id.eq.${viewerAccountId})`,
        )
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle(),
    ]);

  if (block) return "blocked";
  if (connection) return "connected";

  if (pending) {
    return pending.sender_account_id === viewerAccountId
      ? "pending_outgoing"
      : "pending_incoming";
  }

  return "none";
}

export async function hasBlockBetween(
  accountA: string,
  accountB: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocks")
    .select("id")
    .or(
      `and(blocker_account_id.eq.${accountA},blocked_account_id.eq.${accountB}),and(blocker_account_id.eq.${accountB},blocked_account_id.eq.${accountA})`,
    )
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}
