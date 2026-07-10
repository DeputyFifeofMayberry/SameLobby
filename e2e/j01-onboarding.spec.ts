import { test, expect, signInThroughUi, SEED_USERS } from "./fixtures/auth";

test.describe("[SL-T027][e2e] @p1 onboarding journey", () => {
  test("onboarding user signs in through UI and reaches attestation", async ({
    page,
  }) => {
    await signInThroughUi(
      page,
      SEED_USERS.onboarding.email,
      SEED_USERS.onboarding.password,
    );
    await expect(page).toHaveURL(/onboarding\/attestation/);
    await expect(
      page.getByRole("group", { name: /confirm you are 18/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/terms of service/i)).toBeRequired();
    await expect(page.getByLabel(/privacy notice/i)).toBeRequired();
    await expect(page.getByLabel(/community standards/i)).toBeRequired();
  });

  test("completed minimum profile reaches discover", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/discover");
    await expect(page.getByText(/gaming friendship/i)).toBeVisible();
    await page.goto("/profile");
    await expect(page.getByText("Fortnite", { exact: true })).toBeVisible();
    await expect(page.getByText(/same lobby text/i)).toBeVisible();
  });
});
