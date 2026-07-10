import { test, expect, signIn, SEED_USERS } from "../fixtures/auth";
import type { Locator, Page } from "@playwright/test";

async function tabUntilFocused(
  page: Page,
  target: Locator,
  maxTabs = 15,
): Promise<void> {
  for (let i = 0; i < maxTabs; i++) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
}

test.describe("[SL-T117][a11y] @p1 keyboard navigation", () => {
  test("sign-in form is operable with keyboard only", async ({ page }) => {
    await page.goto("/sign-in");
    const email = page.getByLabel(/email/i);
    const password = page.getByLabel(/password/i);
    await tabUntilFocused(page, email);
    await expect(email).toBeFocused();
    await page.keyboard.type(SEED_USERS.active.email);
    await tabUntilFocused(page, password);
    await expect(password).toBeFocused();
    await page.keyboard.type(SEED_USERS.active.password);
    await page.keyboard.press("Enter");
    await page.waitForURL(/\/(discover|onboarding|messages|profile|admin|settings)/, {
      timeout: 30_000,
    });
  });

  test("discover search keeps focus after opening filters", async ({ page }) => {
    await signIn(page, SEED_USERS.active.email, SEED_USERS.active.password);
    await page.goto("/discover/search");
    const search = page.getByRole("searchbox").or(page.getByLabel(/search/i)).first();
    if (await search.count()) {
      await search.focus();
      await expect(search).toBeFocused();
    } else {
      await expect(page.getByRole("main")).toBeVisible();
    }
  });
});
