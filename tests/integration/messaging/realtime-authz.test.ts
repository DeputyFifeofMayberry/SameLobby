import { afterEach, describe, expect, it } from "vitest";
import { assertTestGuards } from "../../support/guards";
import { setFeatureFlag } from "../../support/flags";
import {
  completeActiveProfile,
  connectUsers,
  signInProvisionedUser,
} from "../../support/integration-fixtures";
import { createActorClient } from "../../support/supabase";
import {
  deleteAuthUser,
  provisionAuthUser,
  type ProvisionedUser,
} from "../../support/provision-user";

describe("[SL-T049][realtime] @p0 messaging realtime authz", () => {
  let member: ProvisionedUser | null = null;
  let other: ProvisionedUser | null = null;
  let outsider: ProvisionedUser | null = null;

  afterEach(async () => {
    if (member) await deleteAuthUser(member.authUserId);
    if (other) await deleteAuthUser(other.authUserId);
    if (outsider) await deleteAuthUser(outsider.authUserId);
    member = null;
    other = null;
    outsider = null;
    await setFeatureFlag("messaging_enabled", false);
  });

  it("denies non-members read access to conversation messages", async () => {
    assertTestGuards();
    await setFeatureFlag("messaging_enabled", true);
    await setFeatureFlag("connection_requests_enabled", true);
    member = await provisionAuthUser("rt-auth-a", { status: "active" });
    other = await provisionAuthUser("rt-auth-b", { status: "active" });
    outsider = await provisionAuthUser("rt-auth-c", { status: "active" });
    await completeActiveProfile(member, "RtMember");
    await completeActiveProfile(other, "RtOther");
    await completeActiveProfile(outsider, "RtOutsider");
    const { conversationId } = await connectUsers(member, other);

    const memberSession = await signInProvisionedUser(member);
    const memberActor = await createActorClient(memberSession);
    const retentionAt = new Date();
    retentionAt.setMonth(retentionAt.getMonth() + 12);
    await memberActor.from("messages").insert({
      conversation_id: conversationId,
      sender_account_id: member.accountId,
      body: "Members only",
      retention_at: retentionAt.toISOString(),
    });

    const outsiderSession = await signInProvisionedUser(outsider);
    const outsiderActor = await createActorClient(outsiderSession);
    const { data: leaked } = await outsiderActor
      .from("messages")
      .select("id")
      .eq("conversation_id", conversationId);
    expect(leaked ?? []).toHaveLength(0);
  });
});
