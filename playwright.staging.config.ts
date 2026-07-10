import { defineConfig, devices } from "@playwright/test";

const stagingBaseUrl = process.env.STAGING_BASE_URL;

if (!stagingBaseUrl) {
  throw new Error("STAGING_BASE_URL is required for playwright.staging.config.ts");
}

const parsed = new URL(stagingBaseUrl);
if (!parsed.protocol.startsWith("https")) {
  throw new Error("STAGING_BASE_URL must use HTTPS");
}

const host = parsed.hostname.toLowerCase();
if (host === "localhost" || host === "127.0.0.1" || host.endsWith("samelobby.com")) {
  throw new Error(
    "STAGING_BASE_URL must not target localhost or production (samelobby.com)",
  );
}

// No webServer — tests run against an already-deployed staging host.
export default defineConfig({
  testDir: "./e2e/staging",
  fullyParallel: false,
  timeout: 90_000,
  use: {
    baseURL: stagingBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "stripe-staging",
      testMatch: ["**/*stripe*.spec.ts"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
