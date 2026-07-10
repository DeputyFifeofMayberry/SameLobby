export type SentryAdapter = {
  captureException: (error: unknown) => void;
  captureMessage: (message: string) => void;
};

let adapter: SentryAdapter = {
  captureException() {},
  captureMessage() {},
};

export function setSentryAdapter(next: SentryAdapter): void {
  adapter = next;
}

export function getSentryAdapter(): SentryAdapter {
  return adapter;
}
