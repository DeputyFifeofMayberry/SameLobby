import { test, expect } from "./fixtures/auth";

test.describe("J06 cross-platform compatibility", () => {
  test("game and platform filters lead to a playable profile", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/discover/search");
    await page.getByLabel("Game").selectOption({ label: "Fortnite" });
    await page.getByLabel("Platform").selectOption({ label: "PC" });
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/game=.*platform=/);
    const peer = page.getByRole("article").filter({ hasText: "PeerOne" });
    await expect(peer.getByText("Shared game", { exact: true })).toBeVisible();
    await peer.getByRole("link", { name: "View profile" }).click();
    await expect(page.getByText("Fortnite", { exact: true })).toBeVisible();
    await expect(page.getByText("PC", { exact: true })).toBeVisible();
  });
});
