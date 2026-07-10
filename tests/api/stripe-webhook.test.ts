import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mockInsert = vi.fn();
const mockDeleteEq = vi.fn();
const mockDelete = vi.fn(() => ({ eq: mockDeleteEq }));
const mockFrom = vi.fn(() => ({ insert: mockInsert, delete: mockDelete }));
const mockRpc = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: mockFrom,
    rpc: mockRpc,
  }),
}));

vi.mock("@/domains/billing/entitlements", () => ({
  recomputeEntitlements: vi.fn(),
}));

const constructEvent = vi.fn();
vi.mock("@/domains/billing/stripe", () => ({
  getStripeClient: () => ({
    webhooks: { constructEvent },
    subscriptions: {
      retrieve: vi.fn().mockRejectedValue(new Error("Stripe unavailable")),
    },
  }),
  getStripeWebhookSecret: () => "whsec_test",
}));

describe("[SL-T100][api] @p0 stripe webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    constructEvent.mockReturnValue({
      id: "evt_route",
      type: "invoice.paid",
      livemode: false,
      data: { object: {} },
    });
  });

  it("rejects missing stripe-signature header", async () => {
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Missing signature");
  });

  it("accepts signed webhook payloads", async () => {
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: '{"id":"evt_route"}',
        headers: { "stripe-signature": "sig_test" },
      }),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.received).toBe(true);
  });

  it("returns 400 when signature verification fails", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const response = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
        headers: { "stripe-signature": "bad" },
      }),
    );
    expect(response.status).toBe(400);
  });
});

describe("[SL-T100][api] @p0 stripe webhook processing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
  });

  it("skips duplicate webhook events", async () => {
    mockInsert.mockResolvedValueOnce({ error: { code: "23505" } });
    const { processStripeEvent } = await import("@/domains/billing/webhook");
    await processStripeEvent({
      id: "evt_dup",
      type: "invoice.paid",
      livemode: false,
      data: { object: {} },
    } as never);
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
