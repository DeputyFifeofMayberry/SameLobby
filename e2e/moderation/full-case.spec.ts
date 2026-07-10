import { test, expect } from "../fixtures/auth";

test.describe("[SL-T099][e2e] @p1 full moderation case", () => {
  test("opens safety settings for the active user", async ({ page, activeUser }) => {
    void activeUser;
    await page.goto("/settings/safety");
    await expect(
      page.getByRole("heading", { name: /safety/i }),
    ).toBeVisible();
  });
});
