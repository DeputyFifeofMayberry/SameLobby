import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  GroupDetail,
  GroupInvitationListItem,
  GroupListItem,
} from "@/domains/groups/types";

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

export async function listGroupsForAccount(
  accountId: string,
): Promise<GroupListItem[]> {
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("group_memberships")
    .select("group_id")
    .eq("account_id", accountId)
    .eq("status", "active");

  if (!memberships?.length) return [];

  const groupIds = memberships.map((m) => m.group_id as string);
  const { data: groups } = await supabase
    .from("private_groups")
    .select("id, name, status, size_goal, emblem_key, shared_game_id")
    .in("id", groupIds);

  if (!groups?.length) return [];

  const admin = createAdminClient();
  const gameIds = groups
    .map((g) => g.shared_game_id as string | null)
    .filter((id): id is string => Boolean(id));

  const { data: games } = gameIds.length
    ? await admin.from("games").select("id, name").in("id", gameIds)
    : { data: [] };

  const gameNames = new Map(
    (games ?? []).map((g) => [g.id as string, g.name as string]),
  );

  const items: GroupListItem[] = [];
  for (const group of groups) {
    const { count } = await supabase
      .from("group_memberships")
      .select("account_id", { count: "exact", head: true })
      .eq("group_id", group.id)
      .eq("status", "active");

    items.push({
      id: group.id as string,
      name: group.name as string,
      status: group.status as GroupListItem["status"],
      memberCount: count ?? 0,
      sizeGoal: group.size_goal as number,
      emblemKey: (group.emblem_key as string) ?? null,
      gameName: group.shared_game_id
        ? gameNames.get(group.shared_game_id as string) ?? null
        : null,
    });
  }

  return items;
}

export async function getGroupDetail(
  accountId: string,
  groupId: string,
): Promise<GroupDetail | null> {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("group_memberships")
    .select("role, status")
    .eq("group_id", groupId)
    .eq("account_id", accountId)
    .maybeSingle();

  if (!membership || membership.status !== "active") return null;

  const { data: group } = await supabase
    .from("private_groups")
    .select("*")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) return null;

  const { data: members } = await supabase
    .from("group_memberships")
    .select("account_id, role, status")
    .eq("group_id", groupId)
    .in("status", ["active", "pending_approval"]);

  const memberIds = (members ?? []).map((m) => m.account_id as string);
  const names = await displayNamesForAccounts(memberIds);

  const admin = createAdminClient();
  let gameName: string | null = null;
  if (group.shared_game_id) {
    const { data: game } = await admin
      .from("games")
      .select("name")
      .eq("id", group.shared_game_id)
      .maybeSingle();
    gameName = (game?.name as string) ?? null;
  }

  const { data: invitations } = await supabase
    .from("group_invitations")
    .select("id, invitee_account_id, status")
    .eq("group_id", groupId)
    .eq("status", "pending");

  const inviteeIds = (invitations ?? []).map((i) => i.invitee_account_id as string);
  const inviteeNames = await displayNamesForAccounts(inviteeIds);

  const pendingMembers = (members ?? []).filter(
    (m) => m.status === "pending_approval",
  );
  const pendingMemberIds = pendingMembers.map((m) => m.account_id as string);
  const pendingMemberNames = await displayNamesForAccounts(pendingMemberIds);

  const { data: acceptedInvitations } = await supabase
    .from("group_invitations")
    .select("id, invitee_account_id")
    .eq("group_id", groupId)
    .eq("status", "accepted")
    .in(
      "invitee_account_id",
      pendingMemberIds.length ? pendingMemberIds : ["00000000-0000-0000-0000-000000000000"],
    );

  const invitationByInvitee = new Map(
    (acceptedInvitations ?? []).map((inv) => [
      inv.invitee_account_id as string,
      inv.id as string,
    ]),
  );

  const invitationIds = (acceptedInvitations ?? []).map((inv) => inv.id as string);
  const { data: viewerVotes } = invitationIds.length
    ? await supabase
        .from("group_invitation_approvals")
        .select("invitation_id, approved")
        .eq("voter_account_id", accountId)
        .in("invitation_id", invitationIds)
    : { data: [] };

  const voteByInvitation = new Map(
    (viewerVotes ?? []).map((v) => [
      v.invitation_id as string,
      v.approved as boolean,
    ]),
  );

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("group_id", groupId)
    .eq("kind", "group")
    .maybeSingle();

  return {
    id: group.id as string,
    name: group.name as string,
    status: group.status as GroupDetail["status"],
    sizeGoal: group.size_goal as number,
    emblemKey: (group.emblem_key as string) ?? null,
    gameName,
    ownerAccountId: group.owner_account_id as string,
    viewerRole: membership.role as GroupDetail["viewerRole"],
    members: (members ?? []).map((m) => ({
      accountId: m.account_id as string,
      displayName: names.get(m.account_id as string) ?? "Player",
      role: m.role as GroupDetail["members"][0]["role"],
      status: m.status as GroupDetail["members"][0]["status"],
    })),
    conversationId: (conversation?.id as string) ?? null,
    pendingInvitations: (invitations ?? []).map((inv) => ({
      id: inv.id as string,
      inviteeDisplayName:
        inviteeNames.get(inv.invitee_account_id as string) ?? "Player",
      status: inv.status as GroupDetail["pendingInvitations"][0]["status"],
    })),
    pendingApprovals: pendingMembers.map((m) => {
      const memberId = m.account_id as string;
      const invitationId = invitationByInvitee.get(memberId) ?? "";
      return {
        invitationId,
        inviteeAccountId: memberId,
        inviteeDisplayName: pendingMemberNames.get(memberId) ?? "Player",
        viewerVote: invitationId
          ? (voteByInvitation.get(invitationId) ?? null)
          : null,
      };
    }),
  };
}

export async function listIncomingGroupInvitations(
  accountId: string,
): Promise<GroupInvitationListItem[]> {
  const supabase = await createClient();
  const { data: invitations } = await supabase
    .from("group_invitations")
    .select("id, group_id, inviter_account_id, expires_at")
    .eq("invitee_account_id", accountId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  if (!invitations?.length) return [];

  const groupIds = invitations.map((i) => i.group_id as string);
  const inviterIds = invitations.map((i) => i.inviter_account_id as string);

  const { data: groups } = await supabase
    .from("private_groups")
    .select("id, name")
    .in("id", groupIds);

  const groupNames = new Map(
    (groups ?? []).map((g) => [g.id as string, g.name as string]),
  );
  const inviterNames = await displayNamesForAccounts(inviterIds);

  return invitations.map((inv) => ({
    id: inv.id as string,
    groupId: inv.group_id as string,
    groupName: groupNames.get(inv.group_id as string) ?? "Private group",
    inviterDisplayName:
      inviterNames.get(inv.inviter_account_id as string) ?? "A connection",
    expiresAt: inv.expires_at as string,
  }));
}

export async function countActiveGroupsOwned(accountId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("private_groups")
    .select("id", { count: "exact", head: true })
    .eq("owner_account_id", accountId)
    .eq("status", "active");
  return count ?? 0;
}
