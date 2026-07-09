import { test, expect } from "./fixtures/auth";

test.describe("J04 interruption-friendly play", () => {
  test("user can discuss expectations and choose a bounded session", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/messages");
    await page.getByRole("link", { name: /peerone/i }).click();
    await expect(
      page.getByRole("log", { name: "Message history" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Invite to play" }).click();
    await page.getByLabel("Pick a time").check();
    await expect(page.getByLabel("Session length")).toHaveValue("60");
    await expect(page.getByLabel("Option 1")).toBeRequired();
    await expect(page.getByText(/children|household/i)).toHaveCount(0);
  });
});
