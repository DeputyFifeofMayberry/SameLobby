import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { otherParticipant } from "@/domains/connections/helpers";
import { getSharedGamesForConversation } from "@/domains/play/queries";
import type { TeammateDetail, TeammateListItem } from "@/domains/teammates/types";
import { orderedPair } from "@/domains/connections/helpers";
import { isActiveTeammateStatus } from "@/domains/teammates/schemas";

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

export async function hasCompletedSessionBetween(
  accountA: string,
  accountB: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("has_completed_session_between", {
    p_account_a: accountA,
    p_account_b: accountB,
  });
  return data === true;
}

export async function listTeammatesForAccount(
  accountId: string,
): Promise<TeammateListItem[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("teammate_relationships")
    .select("*")
    .or(`user_a_id.eq.${accountId},user_b_id.eq.${accountId}`)
    .in("status", ["proposed", "teammate", "regular_teammate"])
    .order("updated_at", { ascending: false });

  if (!rows?.length) return [];

  const otherIds = rows.map((r) =>
    r.user_a_id === accountId ? (r.user_b_id as string) : (r.user_a_id as string),
  );
  const names = await displayNamesForAccounts(otherIds);

  const items: TeammateListItem[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const otherId = otherIds[i]!;
    const shared = await getSharedGamesForConversation(accountId, otherId);
    const isProposer = row.proposed_by_account_id === accountId;
    let direction: TeammateListItem["direction"] = "mutual";
    if (row.status === "proposed") {
      direction = isProposer ? "outgoing" : "incoming";
    }

    items.push({
      id: row.id as string,
      otherAccountId: otherId,
      otherDisplayName: names.get(otherId) ?? "Player",
      status: row.status as TeammateListItem["status"],
      direction,
      sharedGameLabels: shared.map((g) => `${g.gameName} · ${g.platformName}`),
      isRegular: row.status === "regular_teammate",
    });
  }

  return items;
}

export async function getTeammateDetail(
  accountId: string,
  relationshipId: string,
): Promise<TeammateDetail | null> {
  const supabase = await createClient();
  const { data: rel } = await supabase
    .from("teammate_relationships")
    .select("*")
    .eq("id", relationshipId)
    .maybeSingle();

  if (!rel) return null;
  if (rel.user_a_id !== accountId && rel.user_b_id !== accountId) return null;

  const otherId =
    rel.user_a_id === accountId
      ? (rel.user_b_id as string)
      : (rel.user_a_id as string);
  const viewerIsUserA = rel.user_a_id === accountId;

  const names = await displayNamesForAccounts([otherId]);

  const { data: note } = await supabase
    .from("teammate_notes")
    .select("body")
    .eq("relationship_id", relationshipId)
    .eq("account_id", accountId)
    .maybeSingle();

  const admin = createAdminClient();
  const { data: conversation } = await admin
    .from("conversations")
    .select("id")
    .eq("connection_id", rel.connection_id as string)
    .maybeSingle();

  return {
    ...(rel as TeammateDetail),
    otherAccountId: otherId,
    otherDisplayName: names.get(otherId) ?? "Player",
    viewerIsUserA,
    viewerAffirmed: viewerIsUserA
      ? (rel.user_a_affirmed as boolean)
      : (rel.user_b_affirmed as boolean),
    otherAffirmed: viewerIsUserA
      ? (rel.user_b_affirmed as boolean)
      : (rel.user_a_affirmed as boolean),
    noteBody: (note?.body as string) ?? null,
    conversationId: (conversation?.id as string) ?? null,
  };
}

export async function listEligibleConnectionsForTeammate(
  accountId: string,
): Promise<{ accountId: string; displayName: string }[]> {
  const supabase = await createClient();
  const { data: connections } = await supabase
    .from("connections")
    .select("id, user_a_id, user_b_id")
    .or(`user_a_id.eq.${accountId},user_b_id.eq.${accountId}`)
    .eq("status", "connected");

  if (!connections?.length) return [];

  const otherIds: string[] = [];
  for (const conn of connections) {
    const otherId = otherParticipant(
      {
        user_a_id: conn.user_a_id as string,
        user_b_id: conn.user_b_id as string,
      },
      accountId,
    );
    if (!(await hasCompletedSessionBetween(accountId, otherId))) continue;

    const pair = orderedPair(accountId, otherId);
    const { data: existing } = await supabase
      .from("teammate_relationships")
      .select("status")
      .eq("user_a_id", pair.userA)
      .eq("user_b_id", pair.userB)
      .maybeSingle();

    if (!existing || !isActiveTeammateStatus(existing.status as string)) {
      otherIds.push(otherId);
    }
  }

  const names = await displayNamesForAccounts(otherIds);
  return otherIds.map((id) => ({
    accountId: id,
    displayName: names.get(id) ?? "Player",
  }));
}
