import { clearActiveUserOpenInvitations, test, expect } from "./fixtures/auth";

test.describe("J08 play invite", () => {
  test.beforeEach(async () => {
    await clearActiveUserOpenInvitations();
  });

  test("connected user can compose a valid play invitation", async ({
    page,
    activeUser,
  }) => {
    void activeUser;
    await page.goto("/messages");
    await page.getByRole("link", { name: /peerone/i }).click();
    await page.getByRole("button", { name: "Invite to play" }).click();
    await expect(
      page.getByRole("dialog", { name: /invite peerone to play/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Game")).toHaveValue(/.+/);
    await page.getByLabel("Platform").selectOption({ index: 1 });
    await page.getByLabel("Note (optional)").fill("Ready for a short session?");
    await page.getByRole("button", { name: "Send invitation" }).click();
    await expect(
      page.getByRole("dialog", { name: /invite peerone to play/i }),
    ).toHaveCount(0);

    await page.goto("/play");
    await expect(
      page.getByRole("heading", { name: "Open invitations" }),
    ).toBeVisible();
    await expect(page.getByText(/outgoing · proposed/i).first()).toBeVisible();
  });
});
