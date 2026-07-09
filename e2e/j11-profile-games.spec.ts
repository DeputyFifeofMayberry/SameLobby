import { resetActiveUserGames, test, expect } from "./fixtures/auth";

test.describe("J11 profile games", () => {
  test.beforeEach(async () => {
    await resetActiveUserGames();
  });

  test("profile adds and removes an active game", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/profile");
    await expect(
      page.getByRole("heading", { name: /games & availability/i }),
    ).toBeVisible();
    await expect(page.getByText("1 of 8 active games")).toBeVisible();

    await page
      .getByLabel("First game")
      .selectOption({ label: "Halo Infinite" });
    await page.getByLabel("Playable platform").selectOption({ label: "PC" });
    await page.getByRole("button", { name: "Add game" }).click();
    await expect(page.getByText("2 of 8 active games")).toBeVisible();

    const haloRow = page
      .getByRole("listitem")
      .filter({ hasText: "Halo Infinite" });
    await expect(haloRow).toContainText("PC");
    await haloRow.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByText("1 of 8 active games")).toBeVisible();
  });
});
