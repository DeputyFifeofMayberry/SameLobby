import { test, expect } from "./fixtures/auth";

test.describe("Admin moderation", () => {
  test("admin scope is blocked until the session reaches AAL2", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/admin/reports");
    await expect(
      page.getByRole("heading", { name: "Admin MFA required" }),
    ).toBeVisible();
    await expect(
      page.getByText(/complete verification in this session/i),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /reports queue/i }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "I have enrolled MFA" }).click();
    await expect(page.getByRole("alert")).toContainText(
      "Complete MFA verification in this session",
    );
  });
});
