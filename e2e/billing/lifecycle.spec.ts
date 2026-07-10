import {
  setActiveUserReadOnly,
  setFeatureFlag,
  test,
  expect,
  signInWithPasswordThroughApi,
} from "../fixtures/auth";

test.describe("[SL-T108][e2e-local-stub] @p1 billing lifecycle", () => {
  test.beforeEach(async () => {
    await setFeatureFlag("stripe_enabled", true);
    await setActiveUserReadOnly(false);
  });

  test.afterEach(async () => {
    await setFeatureFlag("stripe_enabled", false);
    await setActiveUserReadOnly(false);
  });

  test("shows subscription management and read-only lapse messaging", async ({
    page,
  }) => {
    await signInWithPasswordThroughApi(
      page,
      "dev-active@test.local",
      "TestPass123!",
    );

    await page.goto("/subscription");
    await expect(
      page.getByRole("heading", { name: "Manage billing" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Upgrade monthly" }),
    ).toBeVisible();

    await setActiveUserReadOnly(true);
    await page.reload();
    await expect(page.getByText(/read-only until you resubscribe/i)).toBeVisible();
  });
});
