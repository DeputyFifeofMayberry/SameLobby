import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { email: "dev-active@test.local", status: "active" },
  { email: "dev-onboarding@test.local", status: "onboarding" },
  { email: "dev-restricted@test.local", status: "restricted" },
];

for (const user of users) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: "TestPass123!",
    email_confirm: true,
  });

  if (error) {
    console.error(user.email, error.message);
    continue;
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .single();

  if (accountError) {
    console.error("account", user.email, accountError.message);
    continue;
  }

  if (user.status === "active") {
    const { error: rpcError } = await supabase.rpc(
      "complete_account_attestation",
      {
        p_account_id: account.id,
        p_adult_attested_at: new Date().toISOString(),
        p_terms_version: "2026-07-08",
        p_privacy_version: "2026-07-08",
        p_community_standards_version: "2026-07-08",
        p_adult_attestation_version: "2026-07-08",
        p_ip_hash: "seed",
        p_user_agent_hash: "seed",
      },
    );
    if (rpcError) console.error("attest", user.email, rpcError.message);
  } else {
    const { error: updateError } = await supabase
      .from("accounts")
      .update({ status: user.status })
      .eq("id", account.id);
    if (updateError) console.error("status", user.email, updateError.message);
  }

  console.log("ok", user.email);
}
