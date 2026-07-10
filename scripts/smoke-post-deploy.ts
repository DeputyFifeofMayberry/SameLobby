/**
 * Post-deploy smoke checks — run against staging or production URL.
 * SL-T113:live-staging @p1
 *
 * Usage: BASE_URL=https://staging.samelobby.com npx tsx scripts/smoke-post-deploy.ts
 */

const baseUrl =
  process.env.BASE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";

async function check(
  name: string,
  url: string,
  assert: (res: Response) => boolean,
) {
  const res = await fetch(url, { redirect: "follow" });
  if (!assert(res)) {
    throw new Error(`${name} failed: ${url} → ${res.status}`);
  }
  console.log(`✓ ${name}`);
}

async function main() {
  console.log(`Smoke testing ${baseUrl}`);

  await check("health", `${baseUrl}/api/health`, (r) => r.ok);

  await check("sign-in page", `${baseUrl}/sign-in`, (r) => r.ok);

  const flagsRes = await fetch(`${baseUrl}/sign-up`);
  if (!flagsRes.ok) {
    throw new Error(`sign-up page failed: ${flagsRes.status}`);
  }
  const html = await flagsRes.text();
  if (!html.includes("sign") && !html.includes("Sign")) {
    throw new Error("sign-up page missing expected content");
  }
  console.log("✓ sign-up page reachable");

  console.log("All smoke checks passed.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
