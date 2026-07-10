import { test as base, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

export const SEED_USERS = {
  active: {
    email: "dev-active@test.local",
    password: "TestPass123!",
  },
  onboarding: {
    email: "dev-onboarding@test.local",
    password: "TestPass123!",
  },
  restricted: {
    email: "dev-restricted@test.local",
    password: "TestPass123!",
  },
} as const;

export const SEED_AUTH_IDS = {
  active: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  onboarding: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  restricted: "cccccccc-cccc-cccc-cccc-cccccccccccc",
} as const;

const localServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

export function getTestAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? localServiceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export async function getSeedAccountId(authUserId: string): Promise<string> {
  const { data, error } = await getTestAdmin()
    .from("accounts")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function clearActiveUserOpenInvitations(): Promise<void> {
  const accountId = await getSeedAccountId(SEED_AUTH_IDS.active);
  const { error } = await getTestAdmin()
    .from("play_invitations")
    .delete()
    .eq("proposer_account_id", accountId)
    .eq("status", "proposed");
  if (error) throw error;
}

export async function clearActiveUserOwnedGroups(): Promise<void> {
  const accountId = await getSeedAccountId(SEED_AUTH_IDS.active);
  const { error } = await getTestAdmin()
    .from("private_groups")
    .delete()
    .eq("owner_account_id", accountId);
  if (error) throw error;
}

export async function resetActiveUserGames(): Promise<void> {
  const accountId = await getSeedAccountId(SEED_AUTH_IDS.active);
  const { data: fortnite, error: gameError } = await getTestAdmin()
    .from("games")
    .select("id")
    .eq("slug", "fortnite")
    .single();
  if (gameError) throw gameError;

  const { error } = await getTestAdmin()
    .from("user_games")
    .delete()
    .eq("account_id", accountId)
    .neq("game_id", fortnite.id);
  if (error) throw error;
}

export async function setFeatureFlag(
  key: string,
  enabled: boolean,
): Promise<void> {
  const { error } = await getTestAdmin()
    .from("feature_flags")
    .update({ enabled })
    .eq("key", key);
  if (error) throw error;
}

export async function setActiveUserReadOnly(readOnly: boolean): Promise<void> {
  const accountId = await getSeedAccountId(SEED_AUTH_IDS.active);
  const admin = getTestAdmin();

  const { error: subscriptionError } = await admin
    .from("subscriptions")
    .upsert({
      account_id: accountId,
      status: readOnly ? "canceled" : "none",
      stripe_customer_id: null,
      stripe_subscription_id: null,
      cancel_at_period_end: false,
      past_due_since: null,
    });
  if (subscriptionError) throw subscriptionError;

  const { error: entitlementError } = await admin.rpc(
    "recompute_entitlements",
    {
      p_account_id: accountId,
    },
  );
  if (entitlementError) throw entitlementError;
}

export async function signIn(page: Page, email: string, password: string) {
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await Promise.all([
    page.waitForURL(/\/(discover|onboarding|messages|profile|admin|settings)/, {
      timeout: 30_000,
    }),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]);
}

type SeedUser = (typeof SEED_USERS)[keyof typeof SEED_USERS];

export const test = base.extend<{ activeUser: SeedUser }>({
  activeUser: async ({ page }, provideFixture) => {
    await signIn(page, SEED_USERS.active.email, SEED_USERS.active.password);
    await provideFixture(SEED_USERS.active);
  },
});

export { expect };
