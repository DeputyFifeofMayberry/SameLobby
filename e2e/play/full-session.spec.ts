import {
  clearActiveUserOpenInvitations,
  test,
  expect,
  signInWithPasswordThroughApi,
  fixtureNamespace,
} from "../fixtures/auth";

test.describe("[SL-T072][e2e] @p1 full play session", () => {
  test.beforeEach(async () => {
    await clearActiveUserOpenInvitations();
  });

  test("propose, accept, and view a play session", async ({ browser }) => {
    const ns = fixtureNamespace(test.info());
    const proposer = await browser.newPage();
    const recipient = await browser.newPage();

    await signInWithPasswordThroughApi(
      proposer,
      "dev-active@test.local",
      "TestPass123!",
    );
    await signInWithPasswordThroughApi(
      recipient,
      "dev-peer-1@test.local",
      "TestPass123!",
    );

    await proposer.goto("/messages");
    await proposer.getByRole("link", { name: /peerone/i }).click();
    await proposer.getByRole("button", { name: "Invite to play" }).click();
    await proposer
      .getByLabel("Note (optional)")
      .fill(`Session ${ns}`);
    await proposer.getByRole("button", { name: "Send invitation" }).click();

    await recipient.goto("/play");
    await expect(
      recipient.getByRole("heading", { name: "Open invitations" }),
    ).toBeVisible();
    await recipient.getByText(/incoming · proposed/i).first().click();
    await recipient.getByRole("button", { name: /accept/i }).click();

    await proposer.goto("/play");
    await expect(proposer.getByText(/confirmed/i).first()).toBeVisible();

    await proposer.close();
    await recipient.close();
  });
});
