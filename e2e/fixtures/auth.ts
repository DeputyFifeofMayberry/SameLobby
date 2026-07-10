import { test as base, expect, type Page, type TestInfo } from "@playwright/test";
import { createClient, type Session } from "@supabase/supabase-js";

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
  peerOne: {
    email: "dev-peer-1@test.local",
    password: "TestPass123!",
  },
} as const;

export const SEED_AUTH_IDS = {
  active: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  onboarding: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  restricted: "cccccccc-cccc-cccc-cccc-cccccccccccc",
} as const;

const localAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const localServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? localAnonKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function authCookieName(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
  const host = new URL(supabaseUrl).hostname;
  const ref = host === "localhost" ? "localhost" : (host.split(".")[0] ?? host);
  return `sb-${ref}-auth-token`;
}

function appOrigin(page: Page): string {
  if (page.url() && page.url() !== "about:blank") {
    return new URL(page.url()).origin;
  }
  return process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
}

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

async function setSessionCookies(page: Page, session: Session) {
  await page.context().addCookies([
    {
      name: authCookieName(),
      value: JSON.stringify(session),
      url: appOrigin(page),
    },
  ]);
}

async function gotoAuthenticatedHome(page: Page) {
  await page.goto("/discover");
  await page.waitForURL(/\/(discover|onboarding|messages|profile|admin|settings)/, {
    timeout: 30_000,
  });
}

/**
 * Fixture admin only — admin magic-link session for seeding non-auth journeys.
 * D14: do not use in auth-proving tests (session-expiry, sign-in flows).
 */
export async function generateAdminSession(page: Page, email: string) {
  const admin = getTestAdmin();
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (linkError || !linkData.properties?.hashed_token) {
    throw new Error(
      `generateAdminSession failed: ${JSON.stringify(linkError ?? "no hashed_token")}`,
    );
  }

  const { data, error } = await getAnonClient().auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "email",
  });
  if (error || !data.session) {
    throw new Error(
      `verifyOtp failed: ${JSON.stringify(error ?? "no session")}`,
    );
  }

  await setSessionCookies(page, data.session);
  await gotoAuthenticatedHome(page);
}

/**
 * Password API session for non-auth journeys and integration actors (not browser UI).
 */
export async function createAuthenticatedFixtureSession(
  email: string,
  password: string,
): Promise<Session> {
  const { data, error } = await getAnonClient().auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session) {
    throw new Error(
      `createAuthenticatedFixtureSession failed: ${JSON.stringify(error ?? "no session")}`,
    );
  }
  return data.session;
}

/**
 * T006 and actor integration — password auth through Supabase API, then cookie injection.
 * D14: use for auth-proving integration tests instead of generateAdminSession.
 */
export async function signInWithPasswordThroughApi(
  page: Page,
  email: string,
  password: string,
) {
  const session = await createAuthenticatedFixtureSession(email, password);
  await setSessionCookies(page, session);
  await gotoAuthenticatedHome(page);
}

/**
 * Browser auth journeys only — exercises the real sign-in UI.
 */
export async function signInThroughUi(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/(discover|onboarding|messages|profile|admin|settings)/, {
    timeout: 30_000,
  });
}

/**
 * @deprecated Prefer generateAdminSession (fixtures), signInWithPasswordThroughApi (integration),
 * or signInThroughUi (browser). Retained for existing journey specs during Phase 1.
 * D14: do not use in auth-proving tests.
 */
export async function signIn(page: Page, email: string, password: string) {
  try {
    await generateAdminSession(page, email);
  } catch {
    await signInWithPasswordThroughApi(page, email, password);
  }
}

type SeedUser = (typeof SEED_USERS)[keyof typeof SEED_USERS];

export const test = base.extend<{ activeUser: SeedUser }>({
  activeUser: async ({ page }, provideFixture) => {
    await signIn(page, SEED_USERS.active.email, SEED_USERS.active.password);
    await provideFixture(SEED_USERS.active);
  },
});

export { expect };

/** Isolated namespace for parallel E2E fixtures (plan §K). */
export function fixtureNamespace(testInfo: TestInfo): string {
  const runId = process.env.RUN_ID ?? "local";
  return `${testInfo.project.name}-w${testInfo.workerIndex}-p${testInfo.parallelIndex}-${runId}-r${testInfo.retry}`;
}
