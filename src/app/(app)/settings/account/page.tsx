import { AccountSettingsPanel } from "@/components/accounts/AccountSettingsPanel";
import { requireAccount } from "@/domains/accounts/queries";
import { createClient } from "@/lib/supabase/server";

export default async function AccountSettingsPage() {
  const account = await requireAccount();
  const supabase = await createClient();
  const { data: deletion } = await supabase
    .from("deletion_requests")
    .select("status")
    .eq("account_id", account.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Account settings
      </h1>
      <div className="mt-8">
        <AccountSettingsPanel
          account={account}
          deletionStatus={(deletion?.status as string) ?? null}
        />
      </div>
    </div>
  );
}
