export type ResendAdapter = {
  send: (input: { to: string; subject: string; html: string }) => Promise<{ id: string }>;
};

let adapter: ResendAdapter = {
  async send() {
    return { id: "resend-stub" };
  },
};

export function setResendAdapter(next: ResendAdapter): void {
  adapter = next;
}

export function getResendAdapter(): ResendAdapter {
  return adapter;
}
