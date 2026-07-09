import { describe, expect, it, vi, beforeEach } from "vitest";

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

vi.mock("@/domains/billing/stripe", () => ({
  getStripeClient: () => ({
    subscriptions: {
      retrieve: vi.fn().mockRejectedValue(new Error("Stripe unavailable")),
    },
  }),
  getStripeWebhookSecret: () => "whsec_test",
}));

describe("processStripeEvent idempotency", () => {
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

    expect(mockFrom).toHaveBeenCalledWith("stripe_webhook_events");
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("removes the idempotency marker when processing fails", async () => {
    const { processStripeEvent } = await import("@/domains/billing/webhook");

    await expect(
      processStripeEvent({
        id: "evt_retry",
        type: "checkout.session.completed",
        livemode: false,
        data: {
          object: {
            metadata: { account_id: "account-1" },
            subscription: "sub_1",
          },
        },
      } as never),
    ).rejects.toThrow("Stripe unavailable");

    expect(mockDelete).toHaveBeenCalledOnce();
    expect(mockDeleteEq).toHaveBeenCalledWith("stripe_event_id", "evt_retry");
  });
});

describe("stripe webhook route", () => {
  it("rejects missing signature", async () => {
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
});
