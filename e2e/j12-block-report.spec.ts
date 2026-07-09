import { test, expect } from "./fixtures/auth";

test.describe("J12 block and report", () => {
  test("report flow has no upgrade CTA", async ({ page, activeUser }) => {
    void activeUser;
    await page.goto("/messages");
    await page.getByRole("link", { name: /peerone/i }).click();
    await page.getByRole("button", { name: "Report" }).click();
    await expect(
      page.getByRole("dialog", { name: /report peerone/i }),
    ).toBeVisible();
    await page.getByLabel("Category").selectOption("harassment");
    await page
      .getByLabel("What happened?")
      .fill("Repeated hostile messages during an E2E safety check.");
    await page.getByLabel(/include recent messages/i).check();
    await expect(page.getByText(/view plans|upgrade/i)).toHaveCount(0);

    page.once("dialog", (dialog) => dialog.dismiss());
    await page.getByRole("button", { name: "Block" }).click();
    await expect(page).toHaveURL(/messages/);
  });
});
