import { test, expect, signIn, SEED_USERS } from "../fixtures/auth";

const CORE_ROUTES = [
  ["/discover", /gaming friendship/i],
  ["/messages", /messages/i],
  ["/profile", /fortnite/i],
  ["/play", /play/i],
] as const;

test.describe("[SL-T118][e2e] @p1 responsive core journeys", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, SEED_USERS.active.email, SEED_USERS.active.password);
  });

  for (const [route, heading] of CORE_ROUTES) {
    test(`route ${route} is usable at 320px width`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(route);
      await expect(page.getByText(heading).first()).toBeVisible();
      await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
    });
  }

  test("discover remains usable on Pixel 7 viewport", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto("/discover");
    await expect(page.getByText(/gaming friendship/i)).toBeVisible();
  });

  test("profile remains usable in landscape mobile", async ({ page }) => {
    await page.setViewportSize({ width: 915, height: 412 });
    await page.goto("/profile");
    await expect(page.getByText("Fortnite", { exact: true })).toBeVisible();
  });
});
