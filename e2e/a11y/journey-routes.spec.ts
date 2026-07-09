import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect, signIn, SEED_USERS } from "../fixtures/auth";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/help", "/pricing"];

const JOURNEY_ROUTES = [
  ["J02 specific-game search", "/discover/search"],
  ["J03 friendship discovery", "/discover"],
  ["J04 interruption-friendly profile", "/profile"],
  ["J05 communication preferences", "/profile"],
  ["J06 cross-platform search", "/discover/search"],
  ["J07 conversation list", "/messages"],
  ["J08 play invitations", "/play"],
  ["J09 post-play sessions", "/play"],
  ["J10 group creation", "/groups/new"],
  ["J11 profile games", "/profile"],
  ["J12 safety settings", "/settings/safety"],
  ["J13 teammate availability", "/teammates"],
  ["billing subscription", "/subscription"],
  ["safety controls", "/settings/safety"],
] as const;

async function expectNoCriticalViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  const critical = results.violations.filter((violation) => {
    return violation.impact === "critical";
  });
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
}

test.describe("Accessibility — public routes", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`no critical violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expectNoCriticalViolations(page);
    });
  }
});

test.describe("Accessibility — onboarding", () => {
  test("J01 attestation: no critical violations", async ({ page }) => {
    await signIn(
      page,
      SEED_USERS.onboarding.email,
      SEED_USERS.onboarding.password,
    );
    await expect(page).toHaveURL(/onboarding\/attestation/);
    await expectNoCriticalViolations(page);
  });
});

test.describe("Accessibility — authenticated routes", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, SEED_USERS.active.email, SEED_USERS.active.password);
  });

  for (const [journey, route] of JOURNEY_ROUTES) {
    test(`${journey}: no critical violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await expectNoCriticalViolations(page);
    });
  }
});
