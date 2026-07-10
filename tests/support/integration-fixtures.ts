import type { Session } from "@supabase/supabase-js";
import { orderedPair } from "@/domains/connections/helpers";
import type { ProvisionedUser } from "./provision-user";
import {
  createActorClient,
  createFixtureAdmin,
  signInWithPasswordThroughApi,
} from "./supabase";

export type CatalogIds = { gameId: string; platformId: string };

export async function signInProvisionedUser(
  user: ProvisionedUser,
): Promise<Session> {
  return signInWithPasswordThroughApi(user.email, user.password);
}

export async function completeActiveProfile(
  user: ProvisionedUser,
  displayName: string,
): Promise<void> {
  const admin = createFixtureAdmin();
  await admin
    .from("accounts")
    .update({
      status: "active",
      adult_attested_at: new Date().toISOString(),
      time_zone: "America/Los_Angeles",
      locale: "en",
    })
    .eq("id", user.accountId);

  await admin
    .from("gamer_profiles")
    .update({
      display_name: displayName,
      communication_modes: ["same_lobby_text"],
      onboarding_step: "preview",
      onboarding_completed_at: new Date().toISOString(),
      discovery_paused_at: null,
    })
    .eq("account_id", user.accountId);
}

export async function getFortniteCatalogIds(): Promise<CatalogIds> {
  const admin = createFixtureAdmin();
  const { data: game } = await admin
    .from("games")
    .select("id")
    .eq("slug", "fortnite")
    .single();
  const { data: platform } = await admin
    .from("platforms")
    .select("id")
    .eq("slug", "pc")
    .single();
  if (!game?.id || !platform?.id) {
    throw new Error("catalog fixtures missing fortnite/pc");
  }
  return { gameId: game.id as string, platformId: platform.id as string };
}

export async function addUserGame(user: ProvisionedUser): Promise<CatalogIds> {
  const admin = createFixtureAdmin();
  const ids = await getFortniteCatalogIds();
  await admin.from("user_games").upsert(
    {
      account_id: user.accountId,
      game_id: ids.gameId,
      platform_id: ids.platformId,
      is_active: true,
      sort_order: 0,
    },
    { onConflict: "account_id,game_id,platform_id" },
  );
  return ids;
}

export async function sendConnectionRequestAs(
  sender: ProvisionedUser,
  recipientAccountId: string,
  message = "Want to connect",
): Promise<string> {
  const session = await signInProvisionedUser(sender);
  const actor = await createActorClient(session);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const { data, error } = await actor
    .from("connection_requests")
    .insert({
      sender_account_id: sender.accountId,
      recipient_account_id: recipientAccountId,
      message,
      status: "pending",
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("connection request insert failed");
  return data.id as string;
}

export async function acceptConnectionRequestAs(
  recipient: ProvisionedUser,
  requestId: string,
): Promise<string> {
  const session = await signInProvisionedUser(recipient);
  const actor = await createActorClient(session);
  const { data, error } = await actor.rpc("accept_connection_request", {
    p_request_id: requestId,
  });
  if (error) throw error;
  if (!data) throw new Error("accept_connection_request returned no connection id");
  return data as string;
}

export async function getConversationIdForConnection(
  connectionId: string,
): Promise<string | null> {
  const admin = createFixtureAdmin();
  const { data: conversation } = await admin
    .from("conversations")
    .select("id")
    .eq("connection_id", connectionId)
    .maybeSingle();
  return (conversation?.id as string) ?? null;
}

export async function connectUsers(
  userA: ProvisionedUser,
  userB: ProvisionedUser,
): Promise<{ requestId: string; connectionId: string; conversationId: string }> {
  const requestId = await sendConnectionRequestAs(userA, userB.accountId);
  const connectionId = await acceptConnectionRequestAs(userB, requestId);
  let conversationId = await getConversationIdForConnection(connectionId);
  if (!conversationId) {
    const admin = createFixtureAdmin();
    const { data, error } = await admin.rpc("create_conversation_for_connection", {
      p_connection_id: connectionId,
    });
    if (error) throw error;
    conversationId = data as string;
  }
  if (!conversationId) {
    throw new Error("conversation missing after accept");
  }
  return { requestId, connectionId, conversationId };
}

export async function getDirectConversationId(
  accountA: string,
  accountB: string,
): Promise<string | null> {
  const admin = createFixtureAdmin();
  const pair = orderedPair(accountA, accountB);
  const { data: connection } = await admin
    .from("connections")
    .select("id")
    .eq("user_a_id", pair.userA)
    .eq("user_b_id", pair.userB)
    .eq("status", "connected")
    .maybeSingle();
  if (!connection?.id) return null;

  const { data: conversation } = await admin
    .from("conversations")
    .select("id")
    .eq("connection_id", connection.id)
    .maybeSingle();
  return (conversation?.id as string) ?? null;
}

export async function setReadOnlyEntitlements(
  accountId: string,
  readOnly: boolean,
): Promise<void> {
  const admin = createFixtureAdmin();
  const { error: upsertError } = await admin.from("subscriptions").upsert({
    account_id: accountId,
    status: readOnly ? "canceled" : "none",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    cancel_at_period_end: false,
    past_due_since: null,
  });
  if (upsertError) throw upsertError;
  const { error } = await admin.rpc("recompute_entitlements", {
    p_account_id: accountId,
  });
  if (error) throw error;
}

export async function grantAdminScopes(
  accountId: string,
  scopes: string[],
): Promise<void> {
  const admin = createFixtureAdmin();
  const { error } = await admin.from("admin_users").upsert(
    {
      account_id: accountId,
      scopes,
      mfa_enrolled_at: new Date().toISOString(),
      disabled_at: null,
    },
    { onConflict: "account_id" },
  );
  if (error) throw error;
}
