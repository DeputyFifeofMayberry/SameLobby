export type AnalyticsAdapter = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
};

let adapter: AnalyticsAdapter = {
  capture() {},
};

export function setAnalyticsAdapter(next: AnalyticsAdapter): void {
  adapter = next;
}

export function getAnalyticsAdapter(): AnalyticsAdapter {
  return adapter;
}
