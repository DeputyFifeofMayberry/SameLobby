import {
  test,
  expect,
  signInWithPasswordThroughApi,
  fixtureNamespace,
} from "../fixtures/auth";

test.describe("[SL-T061][e2e] @p1 realtime chat", () => {
  test("two users exchange messages in a connected conversation", async ({
    browser,
  }) => {
    const ns = fixtureNamespace(test.info());
    const userA = await browser.newPage();
    const userB = await browser.newPage();

    await signInWithPasswordThroughApi(
      userA,
      "dev-active@test.local",
      "TestPass123!",
    );
    await signInWithPasswordThroughApi(
      userB,
      "dev-peer-1@test.local",
      "TestPass123!",
    );

    const fromA = `A says hi ${ns}`;
    const fromB = `B replies ${ns}`;

    await userA.goto("/messages");
    await userA.getByRole("link", { name: /peerone/i }).click();
    await userA.getByLabel("Message").fill(fromA);
    await userA.getByRole("button", { name: "Send", exact: true }).click();
    await expect(userA.getByText(fromA, { exact: true })).toBeVisible();

    await userB.goto("/messages");
    await userB.getByRole("link", { name: /dev active/i }).click();
    await expect(userB.getByText(fromA, { exact: true })).toBeVisible();
    await userB.getByLabel("Message").fill(fromB);
    await userB.getByRole("button", { name: "Send", exact: true }).click();
    await expect(userB.getByText(fromB, { exact: true })).toBeVisible();

    await userA.reload();
    await expect(userA.getByText(fromB, { exact: true })).toBeVisible();

    await userA.close();
    await userB.close();
  });
});
