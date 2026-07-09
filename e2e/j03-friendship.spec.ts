import { test, expect } from "./fixtures/auth";

test.describe("J03 friendship goal discover", () => {
  test("goal-filtered discovery returns friendship matches", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/discover/search");
    await page
      .getByLabel("Goal")
      .selectOption({ label: "Long-term gaming friendship" });
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/goal=gaming_friendship/);
    await expect(page.getByText("PeerOne", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Long-term gaming friendship", { exact: true }).first(),
    ).toBeVisible();
  });
});
