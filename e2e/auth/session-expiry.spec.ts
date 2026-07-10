import { test, expect, SEED_USERS, signInWithPasswordThroughApi } from "../fixtures/auth";

test.describe("[SL-T010][e2e] @p0 session expiry", () => {
  test("cleared auth cookies require sign-in again", async ({ page }) => {
    // D14: password API auth only — no admin magic-link session.
    await signInWithPasswordThroughApi(
      page,
      SEED_USERS.active.email,
      SEED_USERS.active.password,
    );
    await page.goto("/discover");
    await expect(page).toHaveURL(/\/discover/);

    await page.context().clearCookies();

    await page.goto("/messages");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.url()).toContain("next=");
  });
});
