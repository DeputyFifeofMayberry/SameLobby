import { test, expect } from "./fixtures/auth";

test.describe("J09 post-play", () => {
  test("completed session offers private continuation feedback", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/play");
    await page.getByRole("link", { name: "View session" }).first().click();
    await expect(
      page.getByRole("heading", { name: "Play session" }),
    ).toBeVisible();
    await expect(page.getByText(/status: completed/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /keep this connection going/i }),
    ).toBeVisible();
    await expect(page.getByText(/your choice is private/i)).toBeVisible();
    await page.getByLabel(/play again/i).check();
    await expect(
      page.getByRole("button", { name: "Save response" }),
    ).toBeEnabled();
  });
});
