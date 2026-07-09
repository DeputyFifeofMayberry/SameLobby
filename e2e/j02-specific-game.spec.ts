import { test, expect } from "./fixtures/auth";

test.describe("J02 specific game discover", () => {
  test("active user can filter discover by game", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/discover/search");
    await page.getByLabel("Game").selectOption({ label: "Fortnite" });
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/game=/);
    await expect(
      page.getByRole("heading", { name: /results \([1-9]/i }),
    ).toBeVisible();
    await expect(page.getByText("PeerOne", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Shared game", { exact: true }).first(),
    ).toBeVisible();
  });
});
