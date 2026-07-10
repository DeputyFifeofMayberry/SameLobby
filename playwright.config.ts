import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const isCi = Boolean(process.env.CI);

const localAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const localServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const stagingIgnore = ["**/staging/**"];
const a11yIgnore = ["**/a11y/**"];

// CI builds the app once in the workflow job; webServer only runs `npm run start`.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? "github" : "list",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: isCi
    ? [
        {
          name: "chromium-p0",
          grep: /@p0/,
          testIgnore: [...stagingIgnore, ...a11yIgnore],
          use: { ...devices["Desktop Chrome"] },
        },
        {
          name: "chromium",
          testIgnore: [...stagingIgnore, ...a11yIgnore],
          use: { ...devices["Desktop Chrome"] },
        },
        {
          name: "a11y",
          testMatch: ["**/a11y/**"],
          use: { ...devices["Desktop Chrome"] },
        },
      ]
    : [
        {
          name: "chromium-p0",
          grep: /@p0/,
          testIgnore: [...stagingIgnore, ...a11yIgnore],
          use: { ...devices["Desktop Chrome"] },
        },
        {
          name: "chromium",
          testIgnore: [...stagingIgnore, ...a11yIgnore],
          use: { ...devices["Desktop Chrome"] },
        },
        {
          name: "mobile",
          testIgnore: [...stagingIgnore, ...a11yIgnore],
          use: { ...devices["Pixel 7"] },
        },
        {
          name: "a11y",
          testMatch: ["**/a11y/**"],
          use: { ...devices["Desktop Chrome"] },
        },
      ],
  webServer: isCi
    ? {
        command: "npm run start",
        url: `${baseURL}/api/health`,
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          SKIP_ENV_VALIDATION: "true",
          NEXT_PUBLIC_SUPABASE_URL:
            process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
          NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? localAnonKey,
          SUPABASE_SERVICE_ROLE_KEY:
            process.env.SUPABASE_SERVICE_ROLE_KEY ?? localServiceRoleKey,
          NEXT_PUBLIC_SITE_URL: baseURL,
        },
      }
    : undefined,
});
