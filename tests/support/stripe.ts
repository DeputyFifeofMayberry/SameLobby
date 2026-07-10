export type StripeAdapter = {
  createCheckoutSession: (input: Record<string, unknown>) => Promise<{ url: string }>;
  constructWebhookEvent: (payload: string, signature: string) => unknown;
};

let adapter: StripeAdapter = {
  async createCheckoutSession() {
    return { url: "https://checkout.stripe.test/session" };
  },
  constructWebhookEvent(payload) {
    return JSON.parse(payload);
  },
};

export function setStripeAdapter(next: StripeAdapter): void {
  adapter = next;
}

export function getStripeAdapter(): StripeAdapter {
  return adapter;
}
