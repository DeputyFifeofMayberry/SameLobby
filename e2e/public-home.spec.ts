import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Public home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("communicates the product and links to the core entry points", async ({
    page,
  }) => {
    await expect(page).toHaveTitle(
      "Find gaming friends who fit your life | SameLobby",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Meet compatible gamers/,
    );

    await expect(page.locator("main")).toHaveCount(1);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Meet gamers you'll actually want to play with again.",
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Create your free profile" }).first(),
    ).toHaveAttribute("href", "/sign-up");
    await expect(
      page.getByRole("link", { name: "See how SameLobby works" }),
    ).toHaveAttribute("href", "/how-it-works");

    const publicNavigation = page.getByRole("navigation", { name: "Public" });
    await expect(
      publicNavigation.getByRole("link", { name: "Safety" }),
    ).toHaveAttribute("href", "/safety");
    await expect(
      publicNavigation.getByRole("link", { name: "Pricing" }),
    ).toHaveAttribute("href", "/pricing");
    await expect(
      publicNavigation.getByRole("link", { name: "Sign in" }),
    ).toHaveAttribute("href", "/sign-in");
  });

  test("supports keyboard disclosure and has no serious accessibility violations", async ({
    page,
  }) => {
    const question = page.getByText("Is SameLobby a dating app?", {
      exact: true,
    });
    await question.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByText(
        "No. SameLobby is for platonic gaming friends and teammates.",
        { exact: false },
      ),
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const seriousOrCritical = results.violations.filter((violation) => {
      return violation.impact === "serious" || violation.impact === "critical";
    });
    expect(
      seriousOrCritical,
      JSON.stringify(seriousOrCritical, null, 2),
    ).toEqual([]);
  });

  test("reflows without horizontal overflow at 320 pixels", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.reload();

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Meet gamers you'll actually want to play with again.",
      }),
    ).toBeVisible();
  });
});
