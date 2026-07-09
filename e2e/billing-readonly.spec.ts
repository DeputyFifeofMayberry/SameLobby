import {
  test,
  expect,
  signIn,
  SEED_USERS,
  setActiveUserReadOnly,
} from "./fixtures/auth";

test.describe("Billing read-only", () => {
  test.beforeEach(async () => {
    await setActiveUserReadOnly(true);
  });

  test.afterEach(async () => {
    await setActiveUserReadOnly(false);
  });

  test("lapsed account can read messages but cannot send", async ({ page }) => {
    await signIn(page, SEED_USERS.active.email, SEED_USERS.active.password);
    await page.goto("/subscription");
    await expect(
      page.getByText("Your account is read-only until you resubscribe."),
    ).toBeVisible();

    await page.goto("/messages");
    await page.getByRole("link", { name: /peerone/i }).click();
    await expect(
      page.getByRole("log", { name: "Message history" }),
    ).toBeVisible();
    await page.getByLabel("Message").fill("This should be blocked");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: /subscription ended/i }),
    ).toBeVisible();
  });
});
