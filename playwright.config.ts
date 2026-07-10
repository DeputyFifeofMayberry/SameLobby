import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  // Journey specs mutate shared seeded fixtures and intentionally run in order.
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? "github" : "list",
  timeout: 60_000,
  testIgnore: isCi ? ["**/a11y/**"] : undefined,
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: isCi
    ? [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
    : [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        {
          name: "mobile",
          use: { ...devices["Pixel 7"] },
        },
      ],
  webServer: process.env.CI
    ? {
        command: "npm run start",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          SKIP_ENV_VALIDATION: "true",
          NEXT_PUBLIC_SUPABASE_URL:
            process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
          NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
          NEXT_PUBLIC_SITE_URL: baseURL,
        },
      }
    : undefined,
});
