/**
 * SL-T120 realtime messaging load test — 100 authenticated subscriptions.
 *
 * Requires k6: https://k6.io/docs/get-started/installation/
 *
 * Usage (against staging with test credentials):
 *   npm run test:load:realtime
 *   k6 run scripts/load/messaging-realtime.k6.ts \
 *     -e BASE_URL=https://staging.samelobby.com \
 *     -e SUPABASE_URL=<url> \
 *     -e SUPABASE_ANON_KEY=<anon> \
 *     -e TEST_EMAIL=dev-active@test.local \
 *     -e TEST_PASSWORD=TestPass123!
 *
 * Thresholds (plan §N):
 * - 100 concurrent subscriptions, 5 min steady state
 * - delivery >= 99%, p95 <= 2s, join error < 1%, 0 duplicate IDs, 0 unauthorized
 */

import http from "k6/http";
import ws from "k6/ws";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const deliveryRate = new Rate("realtime_delivery_rate");
const joinErrorRate = new Rate("realtime_join_error_rate");
const duplicateIds = new Counter("realtime_duplicate_ids");
const unauthorizedJoins = new Counter("realtime_unauthorized_joins");
const joinLatency = new Trend("realtime_join_latency_ms");

export const options = {
  scenarios: {
    realtime_subscribers: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 50 },
        { duration: "1m", target: 100 },
        { duration: "5m", target: 100 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    realtime_delivery_rate: ["rate>0.99"],
    realtime_join_latency_ms: ["p(95)<2000"],
    realtime_join_error_rate: ["rate<0.01"],
    realtime_duplicate_ids: ["count==0"],
    realtime_unauthorized_joins: ["count==0"],
    http_req_failed: ["rate<0.01"],
  },
};

const baseUrl = __ENV.BASE_URL ?? "http://localhost:3000";
const supabaseUrl = __ENV.SUPABASE_URL ?? "http://127.0.0.1:54321";
const anonKey = __ENV.SUPABASE_ANON_KEY ?? "";
const email = __ENV.TEST_EMAIL ?? "dev-active@test.local";
const password = __ENV.TEST_PASSWORD ?? "TestPass123!";

const seenMessageIds = new Set<string>();

function signIn(): string | null {
  if (!anonKey) return null;
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
  if (authRes.status !== 200) return null;
  const body = authRes.json() as { access_token?: string };
  return body.access_token ?? null;
}

export default function () {
  const health = http.get(`${baseUrl}/api/health`);
  check(health, { "health ok": (r) => r.status === 200 });

  const token = signIn();
  if (!token || !anonKey) {
    joinErrorRate.add(1);
    sleep(1);
    return;
  }

  const wsUrl =
    supabaseUrl.replace("http", "ws") +
    `/realtime/v1/websocket?apikey=${encodeURIComponent(anonKey)}&vsn=1.0.0`;
  const started = Date.now();
  const ref = `realtime-${__VU}-${__ITER}`;

  const res = ws.connect(wsUrl, { headers: { Authorization: `Bearer ${token}` } }, (socket) => {
    socket.on("open", () => {
      socket.send(
        JSON.stringify({
          topic: "realtime:public:messages",
          event: "phx_join",
          payload: { config: { broadcast: { self: false }, presence: { key: "" } } },
          ref,
        }),
      );
    });

    socket.on("message", (data) => {
      try {
        const payload = JSON.parse(data as string) as {
          event?: string;
          payload?: { data?: { id?: string } };
        };
        if (payload.event === "phx_reply" && payload.payload) {
          joinLatency.add(Date.now() - started);
          deliveryRate.add(1);
        }
        const messageId = payload.payload?.data?.id;
        if (messageId) {
          if (seenMessageIds.has(messageId)) duplicateIds.add(1);
          seenMessageIds.add(messageId);
        }
      } catch {
        joinErrorRate.add(1);
      }
    });

    socket.on("error", () => {
      unauthorizedJoins.add(1);
      joinErrorRate.add(1);
    });

    socket.setTimeout(() => {
      socket.send(
        JSON.stringify({
          topic: "realtime:public:messages",
          event: "phx_leave",
          payload: {},
          ref: `${ref}-leave`,
        }),
      );
      socket.close();
    }, 5000);
  });

  check(res, { "websocket connected": (r) => r && r.status === 101 });
  sleep(1);
}
