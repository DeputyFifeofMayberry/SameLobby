import { AccountSettingsPanel } from "@/components/accounts/AccountSettingsPanel";
import { requireAccount } from "@/domains/accounts/queries";

export default async function AccountSettingsPage() {
  const account = await requireAccount();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Account settings
      </h1>
      <div className="mt-8">
        <AccountSettingsPanel account={account} />
      </div>
    </div>
  );
}
