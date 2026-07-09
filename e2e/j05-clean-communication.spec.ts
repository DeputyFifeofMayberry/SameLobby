import { test, expect } from "./fixtures/auth";

test.describe("J05 clean communication", () => {
  test("communication capability is explicit without sensitive disclosure", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/profile");
    await expect(
      page.getByRole("group", { name: /communication capability/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/same lobby text/i)).toBeChecked();
    await expect(page.getByLabel(/voice chat/i)).toBeChecked();
    await expect(
      page.getByText(/religion|recovery|health condition/i),
    ).toHaveCount(0);
  });
});
