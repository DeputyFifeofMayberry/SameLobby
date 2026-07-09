import { setFeatureFlag, test, expect } from "./fixtures/auth";

test.describe("Billing upgrade", () => {
  test.beforeEach(async () => {
    await setFeatureFlag("stripe_enabled", true);
  });

  test.afterEach(async () => {
    await setFeatureFlag("stripe_enabled", false);
  });

  test("upgrade requires reauthentication before checkout", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/subscription");
    await expect(
      page.getByRole("heading", { name: "Manage billing" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Upgrade monthly" }),
    ).toBeVisible();
    await expect(
      page.getByText(/not visibility, ranking, or safety/i),
    ).toBeVisible();
    await page.getByRole("button", { name: "Upgrade monthly" }).click();
    await expect(page.getByRole("alert")).toContainText(
      "Password is required.",
    );
  });
});
