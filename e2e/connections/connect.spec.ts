import { test, expect, signInWithPasswordThroughApi, fixtureNamespace } from "../fixtures/auth";

test.describe("[SL-T045][e2e] @p1 full connect journey", () => {
  test("discover peer, send request, and see connection in messages", async ({
    browser,
  }) => {
    const ns = fixtureNamespace(test.info());
    const sender = await browser.newPage();
    const recipient = await browser.newPage();

    await signInWithPasswordThroughApi(
      sender,
      "dev-active@test.local",
      "TestPass123!",
    );
    await signInWithPasswordThroughApi(
      recipient,
      "dev-peer-1@test.local",
      "TestPass123!",
    );

    await sender.goto("/messages");
    await expect(sender.getByRole("link", { name: /peerone/i })).toBeVisible();

    await recipient.goto("/messages");
    await expect(
      recipient.getByRole("heading", { name: /messages/i }),
    ).toBeVisible();

    const message = `Connected ${ns}`;
    await sender.goto("/messages");
    await sender.getByRole("link", { name: /peerone/i }).click();
    await sender.waitForURL(/\/messages\/[0-9a-f-]+/);
    await sender.locator("#message-composer-input").fill(message);
    await sender.getByRole("button", { name: "Send", exact: true }).click();
    await recipient.goto("/messages");
    await recipient.getByRole("link", { name: /dev active/i }).click();
    await recipient.waitForURL(/\/messages\/[0-9a-f-]+/);
    await expect(recipient.getByText(message, { exact: true })).toBeVisible();

    await sender.close();
    await recipient.close();
  });
});
