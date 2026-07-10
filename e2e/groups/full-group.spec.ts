import {
  clearActiveUserOwnedGroups,
  test,
  expect,
  signInWithPasswordThroughApi,
  fixtureNamespace,
} from "../fixtures/auth";

test.describe("[SL-T084][e2e] @p1 full group journey", () => {
  test.beforeEach(async () => {
    await clearActiveUserOwnedGroups();
  });

  test("owner creates a group, invites a connection, and opens group chat", async ({
    page,
  }) => {
    const ns = fixtureNamespace(test.info());
    await signInWithPasswordThroughApi(
      page,
      "dev-active@test.local",
      "TestPass123!",
    );

    await page.goto("/groups/new");
    await expect(page.getByRole("heading", { name: "Create private group" })).toBeVisible();
    await expect(page.getByText(/reached the Free limit/i)).toHaveCount(0);
    await page.getByLabel("Group name").fill(`E2E Squad ${ns}`);
    await page.getByLabel(/size goal/i).fill("4");
    await page.locator('input[name="emblemKey"]').first().check();
    await page.getByLabel("PeerOne").check();
    await page.getByRole("button", { name: "Create group" }).click();
    await expect(page).toHaveURL(/\/groups\/[0-9a-f-]+/);
    await expect(page.getByText(/1 \/ 4 members · forming/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Pending invitations" }),
    ).toBeVisible();
    await expect(page.getByText("PeerOne", { exact: true })).toBeVisible();
  });
});
