import { test, expect } from "../fixtures/auth";

test.describe("[SL-T108][e2e-stripe-staging] @p1 billing lifecycle staging", () => {
  test.skip(
    !process.env.STAGING_BASE_URL,
    "Requires STAGING_BASE_URL for Stripe staging evidence",
  );

  test("runs the full Stripe lifecycle on staging", async ({ page }) => {
    const baseUrl = process.env.STAGING_BASE_URL!;
    await page.goto(`${baseUrl}/subscription`);
    await expect(
      page.getByRole("heading", { name: "Manage billing" }),
    ).toBeVisible();
    test.fixme(true, "Wire Stripe test checkout once staging credentials are approved.");
  });
});
