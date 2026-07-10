import AxeBuilder from "@axe-core/playwright";
import {
  test,
  expect,
  signIn,
  SEED_USERS,
  clearActiveUserOwnedGroups,
} from "../fixtures/auth";

const BLOCKING_IMPACTS = new Set(["critical", "serious"]);

test.describe("[SL-T085][a11y] @p2 groups accessibility", () => {
  test.beforeEach(async () => {
    await clearActiveUserOwnedGroups();
  });

  test("new group form has no serious/critical violations", async ({ page }) => {
    await signIn(page, SEED_USERS.active.email, SEED_USERS.active.password);
    await page.goto("/groups/new");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter((violation) =>
      BLOCKING_IMPACTS.has(violation.impact ?? ""),
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
});
