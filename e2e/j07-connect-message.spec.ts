import { test, expect } from "./fixtures/auth";

test.describe("J07 connected conversation", () => {
  test("connected user can send and read a message", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/messages");
    await expect(
      page.getByRole("heading", { name: /messages/i }),
    ).toBeVisible();
    await page.getByRole("link", { name: /peerone/i }).click();
    await expect(
      page.getByRole("log", { name: "Message history" }),
    ).toBeVisible();

    const message = `E2E hello ${test.info().project.name}`;
    await page.getByLabel("Message").fill(message);
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.getByLabel("Message")).toHaveValue("");
    await page.reload();
    await expect(page.getByText(message, { exact: true })).toBeVisible();
  });
});
