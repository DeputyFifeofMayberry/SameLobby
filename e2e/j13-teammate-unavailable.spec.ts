import { clearActiveUserOwnedGroups, test, expect } from "./fixtures/auth";

test.describe("J13 teammate unavailable", () => {
  test.beforeEach(async () => {
    await clearActiveUserOwnedGroups();
  });

  test("group owner records a temporary open seat", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/groups/new");
    await page
      .getByLabel("Group name")
      .fill(`Open Seat ${test.info().project.name}`);
    await page.getByLabel("PeerOne").check();
    await page.getByRole("button", { name: "Create group" }).click();
    await expect(
      page.getByRole("heading", { name: "Open seat" }),
    ).toBeVisible();
    await page.getByLabel("Temporary").check();
    await page.getByLabel(/role note/i).fill("Evenings PT, support role");
    await page.getByRole("button", { name: "Mark open seat" }).click();
    await expect(
      page.getByText("Open seat recorded. Browse Discover when you are ready."),
    ).toBeVisible();
    await expect(page.getByText(/replacement/i)).toHaveCount(0);
  });
});
