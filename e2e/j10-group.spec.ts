import { clearActiveUserOwnedGroups, test, expect } from "./fixtures/auth";

test.describe("J10 group creation", () => {
  test.beforeEach(async () => {
    await clearActiveUserOwnedGroups();
  });

  test("user creates an invitation-only group with a connection", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/groups/new");
    await page
      .getByLabel("Group name")
      .fill(`E2E Squad ${test.info().project.name}`);
    await page.getByLabel(/size goal/i).fill("4");
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
