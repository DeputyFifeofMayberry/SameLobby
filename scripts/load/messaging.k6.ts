/**
 * Optional load test scaffold — 100 concurrent chat connections (Slice 10).
 *
 * Requires k6: https://k6.io/docs/get-started/installation/
 *
 * Usage (against staging with test credentials):
 *   k6 run scripts/load/messaging.k6.ts \
 *     -e BASE_URL=https://staging.samelobby.com \
 *     -e SUPABASE_URL=<url> \
 *     -e SUPABASE_ANON_KEY=<anon> \
 *     -e TEST_EMAIL=dev-active@test.local \
 *     -e TEST_PASSWORD=TestPass123!
 *
 * This script signs in and hits the messages list endpoint as a smoke load pattern.
 * Extend with Realtime subscribe loops for full concurrent chat simulation.
 */

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<2000"],
  },
};

const baseUrl = __ENV.BASE_URL ?? "http://localhost:3000";
const supabaseUrl = __ENV.SUPABASE_URL ?? "http://127.0.0.1:54321";
const anonKey = __ENV.SUPABASE_ANON_KEY ?? "";
const email = __ENV.TEST_EMAIL ?? "dev-active@test.local";
const password = __ENV.TEST_PASSWORD ?? "TestPass123!";

export default function () {
  const health = http.get(`${baseUrl}/api/health`);
  check(health, { "health ok": (r) => r.status === 200 });

  if (anonKey) {
    const authRes = http.post(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      JSON.stringify({ email, password }),
      {
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
        },
      },
    );
    check(authRes, { "auth ok": (r) => r.status === 200 });
  }

  const messagesPage = http.get(`${baseUrl}/messages`, {
    headers: { Accept: "text/html" },
  });
  check(messagesPage, { "messages route": (r) => r.status === 200 || r.status === 307 });

  sleep(1);
}
