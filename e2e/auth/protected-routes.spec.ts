import { test, expect } from "../fixtures/auth";

test.describe("[SL-T001][e2e] @p0 protected routes", () => {
  test("unauthenticated user is redirected to sign-in with next param", async ({
    page,
  }) => {
    await page.goto("/discover");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fdiscover/);
  });

  test("unauthenticated user cannot access messages or profile", async ({
    page,
  }) => {
    await page.goto("/messages");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fmessages/);

    await page.goto("/profile");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fprofile/);
  });

  test("authenticated active user can access discover", async ({ page }) => {
    const { signInWithPasswordThroughApi, SEED_USERS } = await import(
      "../fixtures/auth"
    );
    await signInWithPasswordThroughApi(
      page,
      SEED_USERS.active.email,
      SEED_USERS.active.password,
    );
    await page.goto("/discover");
    await expect(page).toHaveURL(/\/discover/);
    await expect(page.getByRole("heading", { name: /discover/i })).toBeVisible();
  });
});
