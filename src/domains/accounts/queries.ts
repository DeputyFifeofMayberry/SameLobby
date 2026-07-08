import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Account } from "@/domains/accounts/types";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getAccountForUser(
  authUserId: string,
): Promise<Account | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Account;
}

export async function requireAccount(): Promise<Account> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  const account = await getAccountForUser(user.id);
  if (!account) {
    throw new Error("Account not found");
  }
  return account;
}
