import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { signInProvisionedUser } from "../../support/integration-fixtures";
import { createActorClient } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T059][integration] @p1 notification preferences", () => {
  let user: ProvisionedUser | null = null;

  afterEach(async () => {
    if (user) await deleteAuthUser(user.authUserId);
    user = null;
  });

  it("allows owners to read and update notification_preferences", async () => {
    assertTestGuards();
    user = await provisionAuthUser("notif-prefs", { status: "active" });
    const session = await signInProvisionedUser(user);
    const actor = await createActorClient(session);

    const { data: initial } = await actor
      .from("notification_preferences")
      .select("email_new_message")
      .eq("account_id", user.accountId)
      .maybeSingle();
    expect(initial?.email_new_message ?? true).toBe(true);

    const { error: upsertError } = await actor.from("notification_preferences").upsert(
      {
        account_id: user.accountId,
        email_new_message: false,
      },
      { onConflict: "account_id" },
    );
    expect(upsertError).toBeNull();

    const { data: updated } = await actor
      .from("notification_preferences")
      .select("email_new_message")
      .eq("account_id", user.accountId)
      .single();
    expect(updated?.email_new_message).toBe(false);
  });
});
