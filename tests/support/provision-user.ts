import { randomUUID } from "node:crypto";
import { createFixtureAdmin } from "./supabase";

export type ProvisionedUser = {
  authUserId: string;
  email: string;
  password: string;
  accountId: string;
};

export async function provisionAuthUser(
  label: string,
  options?: { password?: string; status?: "onboarding" | "active" },
): Promise<ProvisionedUser> {
  const admin = createFixtureAdmin();
  const authUserId = randomUUID();
  const email = `${label}-${authUserId.slice(0, 8)}@test.local`;
  const password = options?.password ?? "TestPass123!";

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { test_label: label },
    });
  if (createError || !created.user) {
    throw createError ?? new Error("createUser returned no user");
  }

  const authUserIdResolved = created.user.id;
  const { data: account, error: accountError } = await admin
    .from("accounts")
    .select("id")
    .eq("auth_user_id", authUserIdResolved)
    .single();
  if (accountError || !account) {
    throw accountError ?? new Error("provisioned account row missing");
  }

  if (options?.status === "active") {
    const { error: rpcError } = await admin.rpc("complete_account_attestation", {
      p_account_id: account.id,
      p_adult_attested_at: new Date().toISOString(),
      p_terms_version: "2026-07-08",
      p_privacy_version: "2026-07-08",
      p_community_standards_version: "2026-07-08",
      p_adult_attestation_version: "2026-07-08",
      p_ip_hash: "test-ip-hash",
      p_user_agent_hash: "test-ua-hash",
    });
    if (rpcError) throw rpcError;
  }

  return {
    authUserId: authUserIdResolved,
    email,
    password,
    accountId: account.id as string,
  };
}

export async function deleteAuthUser(authUserId: string): Promise<void> {
  const admin = createFixtureAdmin();
  const { error } = await admin.auth.admin.deleteUser(authUserId);
  if (error) throw error;
}
